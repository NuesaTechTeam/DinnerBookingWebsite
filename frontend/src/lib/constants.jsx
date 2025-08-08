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
      "No, you make book more than one seat at a table in one reservation(i.e seat 3 and 5 in table 6 Regular section).But to book a seat maybe one in table 3 VIP section and one in table 10 Regular section, you have to do them seprately.",
  },
  {
    question: "Is there a special discount for engineering students?",
    answer:
      "Yes, engineering students enjoy a special discount of 2000 NGN for regular. An OTP would be sent the email linked to your Matric No to confirm your an engineering student.",
  },
  {
    question: "Can I use the engineering discount for any type of seat?",
    answer:
      "No, discounts are generally valid for regular seats and can only be used once",
  },
  {
    question: "How can I avail the engineering student discount?",
    answer:
      "An OTP would be sent to the email registered to your Matric No to confirm your an engineering student, if the verification is successful the discount would be automatically applied to your payment(Discount only applies for Regular Tables).",
  },
  {
    question: "What if i dont have access to the email linked to my engineering matric no?",
    answer:
      "You would have to make the payment of the full amount, then in school you can visit the nuesa office for a validation and the discount would be refunded to you.",
  },
  {
    question: "How many types of seats are available?",
    answer:
      "We offer VVIP, VIP, Silver and Regular seats. Each type has different pricing.",
  },
  // {
  //   question: "What happens if I reserve a seat but don't make a payment?",
  //   answer:
  //     "Seat reservations without payment will be automatically cleared out after 7 minutes. Complete the payment process within this timeframe to confirm your seats.",
  // },
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
    question: "How does it work?",
    answer: "Only God knows 😊",
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
      number: 2,
      totalSeats: 4,
      bookedSeats: [2, 4],
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
