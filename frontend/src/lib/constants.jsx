import { Crown, Diamond, Shield, User } from "lucide-react";
import {
  BsTwitterX,
  BsInstagram,
  BsWhatsapp,
  BsSnapchat,
} from "react-icons/bs";

export const navbarLinks = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Book a Seat",
    url: "/book",
  },
  {
    title: "Awards Voting",
    url: "/voting",
  },
  {
    title: "Gallery",
    url: "/gallery",
  },
];

export const socialLinks = [
  {
    title: "Twitter",
    icon: <BsTwitterX size={24} className=' hover:text-blue-500' />,
    link: "https://x.com/nuesa_abuad?s=21",
    color: "",
  },
  {
    title: "Snapchat",
    icon: <BsSnapchat size={24} className=' hover:text-yellow-400' />,
    link: "https://snapchat.com/t/LFnYiU0W",
    color: "",
  },
  {
    title: "Instagram",
    icon: <BsInstagram size={24} className=' hover:text-pink-500' />,
    link: "https://www.instagram.com/nuesaabuad?igsh=MThyYzg3aXN5ZHg2bQ==",
    color: "",
  },
  {
    title: "WhatsApp",
    icon: <BsWhatsapp size={24} className=' hover:text-green-500' />,
    link: "/",
    color: "",
  },
];

export const faqs = [
  {
    question: "How do I make a reservation?",
    answer:
      "To make a reservation, simply select the desired seat(s) on the seat map and proceed to checkout.",
  },
  {
    question: "Can I book different types of seats in one reservation?",
    answer:
      "No, you may not book different types of seats (i.e regular and VIP) in one resevation. You have to book them separately. However, you may book several seats at the same table in one reservation (i.e seat 4 and 5 at regular table 4).",
  },
  {
    question: "Is there a special discount for engineering students?",
    answer:
      "Yes, engineering students enjoy a special discount of 2000 NGN for regular. Use the invoice number on your nuesa receipt as the coupon code when making reservations for your seats (Note: This discount only applies for regular table bookings).",
  },
  {
    question: "How can I avail the engineering student discount?",
    answer:
      "To get the ₦2,000 engineering student discount, you must have: 1) Paid your NUESA fees and received a receipt, 2) Submitted your invoice number and details through the official Google Form sent by NUESA. Once submitted and verified, enter your invoice number during checkout for automatic discount application. This discount is only available for Regular table bookings.",
  },
  {
    question: "How many types of seats are available?",
    answer:
      "We offer VVIP, VIP, Silver and Regular seats. Each type has different pricing.",
  },
  {
    question: "Can I modify or cancel my reservation?",
    answer:
      "Once a reservation is confirmed, modifications or cancellations may not be possible. Please ensure the details are correct before confirming your booking.",
  },
  {
    question: "How do I contact customer support for assistance?",
    answer:
      "For any assistance or inquiries, please reach out to our customer support team through the provided contact channels on our website.",
  },
  {
    question: "What if I'm paying for multiple seats?",
    answer:
      "If you're paying for multiple seats, please ensure that you and all additional guests arrive together at the event. Only one verification email and QR code will be sent to the payer's email address. The entire group must be present with the payer for entry verification.",
  },
  {
    question: "Where can I find my NUESA receipt invoice number?",
    answer:
      "Your invoice number can be found on your official NUESA payment receipt. It's typically a unique alphanumeric code printed on the receipt you received after paying your engineering fees. Remember: You must also submit this invoice number through the Google Form for it to work in our system.",
  },
  {
    question: "Can I use my invoice number more than once?",
    answer:
      "No, each invoice number can only be used once for the engineering student discount. Once applied to a booking, the invoice number cannot be reused for additional discounts.",
  },
  {
    question: "What if my invoice number doesn't work?",
    answer:
      "Ensure you: 1) Entered the invoice number correctly, 2) Submitted it via the official NUESA Google Form, 3) Haven't used it before. If you didn't submit the Google Form, your invoice number won't work. Contact NUESA support with proof of both payment and form submission.",
  },
  {
    question: "Can I get the discount for VIP or other premium tables?",
    answer:
      "No, the engineering student discount is exclusively available for Regular table bookings only. Premium tables (VVIP, VIP, Silver) are not eligible for this discount.",
  },
  {
    question:
      "What happens if I'm paying for friends but they arrive separately?",
    answer:
      "All guests must arrive together with the person who made the booking. The verification QR code is only sent to the booker's email, and security will only allow entry to the entire group at once. We cannot accommodate separate entries for group bookings.",
  },
  {
    question: "Can I transfer my discount to someone else?",
    answer:
      "No, the engineering student discount is non-transferable and can only be used by the student whose invoice number is being verified. The booking must match the student's details for the discount to be valid.",
  },
];

export const testimonials = [
  {
    name: "The Consigliere",
    text: "An evening of unparalleled sophistication. The atmosphere was intoxicating.",
    rating: 5,
  },
  {
    name: "Don Salvatore",
    text: "They made us an offer we couldn't refuse. Absolutely magnificent.",
    rating: 5,
  },
  {
    name: "La Famiglia",
    text: "Honor, respect, and the finest dining experience. This is how business is done.",
    rating: 5,
  },
];

export const packages = [
  {
    name: "Soldier",
    price: "₦8,000",
    guests: "Regular",
    features: [
      "General access seating",
      "Standard meal and refreshments",
      "Light entertainment",
      "Complimentary treats",
    ],
    icon: <User className='w-6 h-6' />,
  },
  {
    name: "Capo",
    price: "₦18,000",
    guests: "Silver",
    features: [
      "Central section seating",
      "Standard plated meal and beverage",
      "Snack and drink combo",
      "Complimentary sweets and refreshments",
    ],
    icon: <Shield className='w-6 h-6' />,
  },
  {
    name: "Underboss",
    price: "₦25,000",
    guests: "VIP Experience",
    features: [
      "Priority seating in VIP section",
      "Curated multi-course meal service",
      "Table-served refreshments",
      "Complimentary beverages",
      "Exclusive guest souvenir",
    ],
    icon: <Diamond className='w-6 h-6' />,
  },
  {
    name: "Don",
    price: "₦40,000",
    guests: "VVIP Experience",
    features: [
      "Premium front-row seating",
      "Exclusive 3-course fine dining experience",
      "Wide selection of premium beverages",
      "Dedicated personal service",
      "Signature souvenirs and keepsakes",
      "Access to photo sessions",
      "Priority guest treatment",
    ],
    icon: <Crown className='w-6 h-6' />,
  },
];

export const features = [
  {
    icon: <Shield className='w-8 h-8' />,
    title: "Absolute Discretion",
    description:
      "What happens at Casablanca, stays at Casablanca. Privacy and exclusivity guaranteed for all members of the famiglia.",
  },
  {
    icon: <Crown className='w-8 h-8' />,
    title: "Uncompromising Quality",
    description:
      "Only the finest ingredients, prepared by masters of their craft. We accept nothing less than perfection.",
  },
  {
    icon: <Diamond className='w-8 h-8' />,
    title: "Legendary Service",
    description:
      "Service so impeccable, it becomes the stuff of legend. Every need anticipated, every desire fulfilled.",
  },
];

export const tables = {
  vvip: [
    {
      id: "V1",
      number: 1,
      totalSeats: 4,
      bookedSeats: [1, 3],
      section: "vvip",
    },
    {
      id: "V2",
      no_of_fruits: 4,
      number: 2,
      totalSeats: 4,
      bookedSeats: [2, 4],
      hii: ["yhe", 4, 8,],
      section: "vvip",
    },
    { id: "V3", number: 3, totalSeats: 4, bookedSeats: [], section: "vvip" },
    {
      id: "V4",
      number: 4,
      totalSeats: 4,
      bookedSeats: [1, 2, 3, 4],
      section: "vvip",
    },
    {
      id: "V5",
      number: 5,
      totalSeats: 4,
      bookedSeats: [1, 2, 4],
      section: "vvip",
    },
    {
      id: "V6",
      number: 6,
      totalSeats: 4,
      bookedSeats: [4],
      section: "vvip",
    },
    {
      id: "V7",
      number: 7,
      totalSeats: 4,
      bookedSeats: [],
      section: "vvip",
    },
    {
      id: "V8",
      number: 8,
      totalSeats: 4,
      bookedSeats: [1, 2, 3, 4],
      section: "vvip",
    },
  ],
  vip: [
    { id: "P1", number: 5, totalSeats: 8, bookedSeats: [1, 2], section: "vip" },
    { id: "P2", number: 6, totalSeats: 4, bookedSeats: [3], section: "vip" },
    { id: "P3", number: 7, totalSeats: 8, bookedSeats: [1, 4], section: "vip" },
    { id: "P4", number: 8, totalSeats: 8, bookedSeats: [], section: "vip" },
    { id: "P5", number: 9, totalSeats: 4, bookedSeats: [2, 5], section: "vip" },
    {
      id: "P6",
      number: 10,
      totalSeats: 8,
      bookedSeats: [1, 2, 3, 4, 5, 6, 7, 8],
      section: "vip",
    },
  ],
  silver: [
    {
      id: "S1",
      number: 11,
      totalSeats: 5,
      bookedSeats: [1, 3, 5],
      section: "silver",
    },
    {
      id: "S2",
      number: 12,
      totalSeats: 5,
      bookedSeats: [2],
      section: "silver",
    },
    {
      id: "S3",
      number: 13,
      totalSeats: 5,
      bookedSeats: [1, 2, 3],
      section: "silver",
    },
    {
      id: "S4",
      number: 14,
      totalSeats: 5,
      bookedSeats: [4, 5],
      section: "silver",
    },
    { id: "S5", number: 15, totalSeats: 8, bookedSeats: [], section: "silver" },
    {
      id: "S6",
      number: 16,
      totalSeats: 5,
      bookedSeats: [1, 2, 3, 4, 5],
      section: "silver",
    },
  ],
  regular: [
    {
      id: "R1",
      number: 17,
      totalSeats: 6,
      bookedSeats: [1, 2],
      section: "regular",
    },
    {
      id: "R2",
      number: 18,
      totalSeats: 6,
      bookedSeats: [3, 4, 5],
      section: "regular",
    },
    {
      id: "R3",
      number: 19,
      totalSeats: 6,
      bookedSeats: [1],
      section: "regular",
    },
    {
      id: "R4",
      number: 20,
      totalSeats: 6,
      bookedSeats: [2, 4, 6],
      section: "regular",
    },
    {
      id: "R5",
      number: 21,
      totalSeats: 6,
      bookedSeats: [],
      section: "regular",
    },
    {
      id: "R6",
      number: 22,
      totalSeats: 6,
      bookedSeats: [1, 3, 5, 6],
      section: "regular",
    },
    {
      id: "R7",
      number: 23,
      totalSeats: 6,
      bookedSeats: [2, 6],
      section: "regular",
    },
    {
      id: "R8",
      number: 24,
      totalSeats: 6,
      bookedSeats: [1, 2, 3, 4, 5, 6],
      section: "regular",
    },
    {
      id: "R9",
      number: 25,
      totalSeats: 6,
      bookedSeats: [1],
      section: "regular",
    },
    {
      id: "R10",
      number: 26,
      totalSeats: 6,
      bookedSeats: [2, 3, 6],
      section: "regular",
    },
    {
      id: "R11",
      number: 27,
      totalSeats: 6,
      bookedSeats: [6],
      section: "regular",
    },
    {
      id: "R12",
      number: 28,
      totalSeats: 6,
      bookedSeats: [],
      section: "regular",
    },
    {
      id: "R13",
      number: 29,
      totalSeats: 6,
      bookedSeats: [1, 2, 5, 6],
      section: "regular",
    },
    {
      id: "R14",
      number: 30,
      totalSeats: 6,
      bookedSeats: [1, 2],
      section: "regular",
    },
    {
      id: "R15",
      number: 31,
      totalSeats: 6,
      bookedSeats: [1, 2, 3, 4, 5, 6],
      section: "regular",
    },
    {
      id: "R16",
      number: 32,
      totalSeats: 6,
      bookedSeats: [1, 2, 4, 5, 6],
      section: "regular",
    },
  ],
};
