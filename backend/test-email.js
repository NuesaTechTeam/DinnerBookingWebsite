import dotenv from "dotenv"
import { sendConfirmationEmail, testing, sendPresidentEmail } from "./utils/emailService.js";

dotenv.config(); 


const testBooking = {
  _id: "test123",
  name: "Emma Then",
  matricNo: "21/ENG02/029",
  email: "okoyemcpaul86@gmail.com", // Send to yourself for testing
  phone: "+2348123456789",
  amount: 32000,
  createdAt: new Date(),
  seats: [
    {
      seatNumber: "VVIP-1-S1",
      table: { tableNumber: "VVIP-5" },
    },
  ],
};

const emails = [
  {
    name: "Osama Nehikhare",
    email: "Osamanehikhare@gmail.com",
  },
  {
    name: "Azike Ifeanyi Daniel",
    email: "Ifeanyiazike166@gmail.com",
  },
  {
    name: "Kienabere Emmanuel Emmanuel",
    email: "apiriboemmanuel@gmail.com",
  },
  {
    name: "Chinenye Chine",
    email: "drsomelina@gmail.com",
  },
  {
    name: "Wagbatsoma Oritsetotayiri Anita",
    email: "anitawagbs@gmail.com",
  },
  {
    name: "Owolabi Oluwafunmilayo",
    email: "funmilayo2470@gmail.com",
  },
  {
    name: "Obi Solomon Chukwunonso",
    email: "solomonobi277@gmail.com",
  },
  {
    name: "Ehizogie Jeffrey",
    email: "jeffjayden6102@gmail.com",
  },
  {
    name: "IZEKOR PECULIAR OSAREYEKEMWEN",
    email: "izekorpeculiar05@gmail.com",
  },
  {
    name: "Igwe Johnpaul",
    email: "johnxvpaul@gmail.com",
  },
  {
    name: "",
    email: "",
    position: "Male Social Director",
    note: "No name/email provided",
  },
  {
    name: "Hillary- Edjere Eseoghene",
    email: "sisiphohillaryedjere@gmail.com",
    position: "Female Sports Director",
  },
  {
    name: "Ezeamaka Charles",
    email: "ezeamakacharles@gmail.com",
    position: "Chief Of Staff",
  },
  {
    name: "Ahiakwo Karissa",
    email: "karissaahiakwo@gmail.com",
    position: "Welfare Officer",
  },
  {
    name: "Nasir Dauda",
    email: "nasirdaud2015@gmail.com",
    position: "Technical Secretary",
  },
  {
    name: "Olajuyigbe Daniel Oluwasanmi",
    email: "dannyolaj@gmail.com",
    position: "Gen Secretary",
  },
  {
    name: "Stephen Oleka Amarachi",
    email: "stephanieoleka@gmail.com",
    position: "Female Social Director",
  },
  {
    name: "Lawrence David",
    email: "davidlawrence44330@gmail.com",
    position: "Male Sports Director",
  },
  {
    name: "Araoluwa Ayanbadejo",
    email: "araoluwa.ayanbadejo2005@gmail.com",
    position: "Academic Director",
  },
  {
    name: "Ughovero Prosper",
    email: "itsprosperugh@gmail.com",
    position: "Assistant Gen Sec",
  },
  {
    name: "Lawal Mustapha Mohammed",
    email: "lawalmuhmustapha@gmail.com",
    position: "Fin Secretary",
  },
  {
    name: "Ezeaku Daniel",
    email: "danielezeaku0@gmail.com",
    position: "Treasurer",
  },
  {
    name: "Adeniyi Emmanuel",
    email: "emmanueladeniyi722@gmail.com",
    position: "Public Relations Officer",
  },
  {
    name: "Adebayo Emmanuel",
    email: "nuelbayo01@gmail.com",
    position: "Editor-in-Chief",
  },
  {
    name: "Akerele Obaoluwa",
    email: "obaloluwaakerele@gmail.com",
    position: "Creative Director",
  },
  {
    name: "Wejih Destiny",
    email: "destinywejih4real@gmail.com",
    position: "Director of External Affairs",
  },
  {
    name: "Adigun Adefolawe",
    email: "adefolaweadigun16@gmail.com",
    position: "Head of Elites",
  },
];


const done = [
  {
    _id: "6922e6ffe75cee92e9637c17",
    name: "Prof. Femi Onibonoje",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our highly distinguished Provost",
    tableNumber: "VVIP-4",
    seatNumber: "VVIP-4-S16",
  },
  {
    _id: "6922e83b88fc5143cc4d8d27",
    name: "Dr. Alex Avwunuketa",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our esteemed Staff Advisor",
    tableNumber: "VVIP-4",
    seatNumber: "VVIP-4-S15",
  },
  {
    _id: "6922e8beabdbce3f50e53073",
    name: "Engr. Dr. I. P. Okokpujie",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our distinguished academic mentor",
    tableNumber: "VVIP-4",
    seatNumber: "VVIP-4-S14",
  },
  {
    _id: "6922e98119d4bed579757d02",
    name: "Engr. Fabunmi Temitayo",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our distinguished academic mentor",
    tableNumber: "VVIP-4",
    seatNumber: "VVIP-4-S13",
  },
  {
    _id: "6922ea38a41661a2371496fc",
    name: "Engr. IK Ogbonna",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our distinguished academic mentor",
    tableNumber: "VVIP-6",
    seatNumber: "VVIP-6-S5",
  },
];

const ids = [
  {
    _id: "6922ea38a41661a2371496fc",
    name: "Engr. IK Ogbonna",
    email: "okoyemcpaul86@gmail.com",
    greeting: "Our distinguished academic mentor",
    tableNumber: "VVIP-6",
    seatNumber: "VVIP-6-S5",
  },
];


  const bookings = [
    {
      _id: "6921b7db8d5486e19fe328f7",
      email: "cossaabuad22@gmail.com",
      fullName: "Akanbi Abdulbaar",
      tableNumber: "VVIP-2",
      seatNumber: "VVIP-2-S7",
      association: "COSSA",
    },
    {
      _id: "6921b88bf9f9637ffa6db45f",
      email: "kingsabel538@gmail.com",
      fullName: "Ogbonnaya Abel",
      tableNumber: "VVIP-2",
      seatNumber: "VVIP-2-S8",
      association: "SAMSSA",
    },
    {
      _id: "6921b903b8c74eb0f11e9999",
      email: "sulaimanjabirayodeji@gmail.com",
      fullName: "Sulaiman Jabir Ayodeji",
      tableNumber: "VVIP-3",
      seatNumber: "VVIP-3-S9",
      association: "COMHSSA",
    },
    {
      _id: "6921b9465c07baf8c17327f8",
      email: "otamilore6@gmail.com",
      fullName: "Tamitoye Oluwatamilore",
      tableNumber: "VVIP-3",
      seatNumber: "VVIP-3-S10",
      association: "PANS",
    },
    {
      _id: "6921b99c905d481e5a04646a",
      email: "lss@abuad.edu.ng",
      fullName: "Akanbi Abdulbaar",
      tableNumber: "VVIP-3",
      seatNumber: "VVIP-3-S11",
      association: "LSS",
    },
    {
      _id: "6921b9d4254e892dcc673e6f",
      email: "dh1234david@gmail.com",
      fullName: "Harrison David Obinuchi",
      tableNumber: "VVIP-3",
      seatNumber: "VVIP-3-S12",
      association: "SRC",
    },
  ];


ids.forEach((booking) => {
  sendPresidentEmail(booking)
    .then((success) => {
      console.log("Test email sent:", success);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test email failed:", error);
      process.exit(1);
    });
})


// sendPresidentEmail(booking)
//   .then((success) => {
//     console.log("Test email sent:", success);
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error("Test email failed:", error);
//     process.exit(1);
//   });
