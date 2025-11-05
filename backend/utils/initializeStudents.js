import mongoose from "mongoose";
import xlsx from "xlsx";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Student } from "../models/studentModel.js";
import { log } from "console";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Script started");
console.log("📁 File path:", process.argv[2]);

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log("❌ Please provide the path to the Excel file:");
  console.log("   npm run import-students path/to/your/file.xlsx");
  process.exit(1);
}

const importEngineeringStudents = async (filePath) => {
  console.log("starting");

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${jsonData.length} records in Excel file`);

    // Transform and validate data
    const studentsToImport = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      try {
        // Map Excel columns to schema fields
        const studentData = {
          fullName: row["Student Name"]?.toString().trim(),
          email: row["Student Email"]?.toString().toLowerCase().trim(),
          matricNo: row["Student Matric No"]?.toString().toUpperCase().trim(),
          level: row["Level"]?.toString().trim(),
          department: row["Department"]?.toString().trim(),
          invoiceNumber: row["Invoice Number"]?.toString().toUpperCase().trim(),
          transactionNumber: row["Transaction Number"]?.toString().trim(),
        };

        // Validate required fields
        if (!studentData.fullName) {
          errors.push(`Row ${i + 2}: Missing Student Name`);
          continue;
        }
        if (!studentData.email) {
          errors.push(`Row ${i + 2}: Missing Student Email`);
          continue;
        }
        if (!studentData.matricNo) {
          errors.push(`Row ${i + 2}: Missing Matric No`);
          continue;
        }
        if (!studentData.invoiceNumber) {
          errors.push(`Row ${i + 2}: Missing Invoice Number`);
          continue;
        }
        if (!studentData.transactionNumber) {
          errors.push(`Row ${i + 2}: Missing Transaction Number`);
          continue;
        }

        studentsToImport.push(studentData);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    console.log(`✅ Validated ${studentsToImport.length} records`);
    console.log(`❌ Found ${errors.length} errors`);

    // Display errors
    if (errors.length > 0) {
      console.log("\n⚠️  Errors found:");
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Import to database with error handling for duplicates
    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const studentData of studentsToImport) {
      try {
        // Check for existing student with same matricNo or invoiceNumber
        const existingStudent = await Student.findOne({
          $or: [
            { matricNo: studentData.matricNo },
            { invoiceNumber: studentData.invoiceNumber },
          ],
        });

        if (existingStudent) {
          console.log(
            `⚠️  Skipping duplicate: ${studentData.fullName} (Matric: ${studentData.matricNo})`
          );
          duplicateCount++;
          continue;
        }

        // Create new student
        const student = new Student(studentData);
        await student.save();
        console.log(`✅ Imported: ${studentData.fullName}`);
        importedCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Duplicate skipped: ${studentData.fullName}`);
          duplicateCount++;
        } else {
          console.log(
            `❌ Error importing ${studentData.fullName}: ${error.message}`
          );
          errorCount++;
        }
      }
    }

    // const analyzeAndImportStudents = async (studentsToImport) => {
    //   try {
    //     console.log("🔍 Analyzing Excel data against database...");

    //     // Get all existing records
    //     const existingStudents = await Student.find(
    //       {},
    //       "matricNo invoiceNumber fullName"
    //     );

    //     const existingMatricNos = new Set(
    //       existingStudents.map((s) => s.matricNo)
    //     );
    //     const existingInvoiceNumbers = new Set(
    //       existingStudents.map((s) => s.invoiceNumber)
    //     );

    //     // Categorize students
    //     const results = {
    //       missing: [], // Not in database at all
    //       duplicateMatric: [], // Matric number exists
    //       duplicateInvoice: [], // Invoice number exists
    //       toImport: [], // Ready for import
    //     };

    //     for (const studentData of studentsToImport) {
    //       const hasMatricNo = existingMatricNos.has(studentData.matricNo);
    //       const hasInvoiceNumber = existingInvoiceNumbers.has(
    //         studentData.invoiceNumber
    //       );

    //       if (hasMatricNo && hasInvoiceNumber) {
    //         results.duplicateMatric.push({
    //           ...studentData,
    //           reason: "Both matric and invoice exist",
    //         });
    //       } else if (hasMatricNo) {
    //         results.duplicateMatric.push({
    //           ...studentData,
    //           reason: "Matric number exists",
    //         });
    //       } else if (hasInvoiceNumber) {
    //         results.duplicateInvoice.push({
    //           ...studentData,
    //           reason: "Invoice number exists",
    //         });
    //       } else {
    //         results.missing.push(studentData);
    //         results.toImport.push(studentData);
    //       }
    //     }

    //     // Generate detailed report
    //     console.log("\n📈 ANALYSIS REPORT:");
    //     console.log(`📊 Total in Excel: ${studentsToImport.length}`);
    //     console.log(`📊 Existing in DB: ${existingStudents.length}`);
    //     console.log(`✅ Ready to import: ${results.toImport.length}`);
    //     console.log(`❌ Missing from DB: ${results.missing.length}`);
    //     console.log(`⚠️  Duplicate matric: ${results.duplicateMatric.length}`);
    //     console.log(
    //       `⚠️  Duplicate invoice: ${results.duplicateInvoice.length}`
    //     );

    //     // Show sample of missing students
    //     if (results.missing.length > 0) {
    //       console.log("\n👥 Sample of missing students:");
    //       results.missing.forEach((student, index) => {
    //         console.log(
    //           `  ${index + 1}. ${student.fullName} (${student.matricNo}) - ${
    //             student.invoiceNumber
    //           }`
    //         );
    //       });
    //       if (results.missing.length > 5) {
    //         console.log(`  ... and ${results.missing.length - 5} more`);
    //       }
    //     }

    //     // Show sample of duplicates
    //     if (results.duplicateMatric.length > 0) {
    //       console.log("\n🚫 Sample of duplicate matric numbers:");
    //       results.duplicateMatric.forEach((student, index) => {
    //         console.log(
    //           `  ${index + 1}. ${student.fullName} (${student.matricNo})`
    //         );
    //       });
    //     }

    //     if (results.duplicateInvoice.length > 0) {
    //       console.log("\n🚫 Sample of duplicate invoice numbers:");
    //       results.duplicateInvoice.forEach((student, index) => {
    //         console.log(
    //           `  ${index + 1}. ${student.fullName} - ${student.invoiceNumber}`
    //         );
    //       });
    //     }

    //     return results;
    //   } catch (error) {
    //     console.error("Error analyzing students:", error);
    //     return {
    //       missing: [],
    //       duplicateMatric: [],
    //       duplicateInvoice: [],
    //       toImport: [],
    //     };
    //   }
    // };

    // await analyzeAndImportStudents(studentsToImport);

    // Summary
    console.log("\n📈 Import Summary:");
    console.log(`✅ Successfully imported: ${importedCount}`);
    console.log(`⚠️  Duplicates skipped: ${duplicateCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${jsonData.length}`);
  } catch (error) {
    console.error("❌ Import failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Helper function to map department names to standardized values
function mapDepartment(department) {
  if (!department) return "Other";

  const departmentMap = {
    "civil engineering": "Civil Engineering",
    civil: "Civil Engineering",
    "mechanical engineering": "Mechanical Engineering",
    mechanical: "Mechanical Engineering",
    "electrical engineering": "Electrical Engineering",
    electrical: "Electrical Engineering",
    "computer engineering": "Computer Engineering",
    computer: "Computer Engineering",
    "chemical engineering": "Chemical Engineering",
    chemical: "Chemical Engineering",
  };

  const normalized = department.toLowerCase().trim();
  return departmentMap[normalized] || "Other";
}

// Helper function to parse payment date from timestamp
function parsePaymentDate(timestamp) {
  if (!timestamp) return new Date(); // Default to current date if not provided

  try {
    // Try to parse Excel date (numeric) or string date
    if (typeof timestamp === "number") {
      // Excel dates are numbers where 1 = Jan 1, 1900
      return xlsx.SSF.parse_date_code(timestamp);
    } else if (typeof timestamp === "string") {
      return new Date(timestamp);
    } else {
      return new Date(); // Fallback to current date
    }
  } catch (error) {
    console.log(`⚠️  Could not parse date: ${timestamp}, using current date`);
    return new Date();
  }
}

// ES Module way to check if this is the main module
// const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// // Run the import if this file is executed directly
// if (isMainModule) {
//   const filePath = process.argv[2];

//   if (!filePath) {
//     console.log('❌ Please provide the path to the Excel file:');
//     console.log('   npm run import-students path/to/your/file.xlsx');
//     process.exit(1);
//   }

//   importEngineeringStudents(filePath);
// }

importEngineeringStudents(filePath);

export default importEngineeringStudents;
