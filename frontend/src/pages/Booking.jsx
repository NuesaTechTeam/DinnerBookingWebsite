import React, { useEffect, useState } from "react";
import {
  CheckoutForm,
  SeatSelection,
} from "../components/Booking";
import { useTables } from "../hooks/tableHooks";
import { Error, LoadingScreen } from "../components";
import { useSeatManagement } from "../hooks/seatHooks";
import {
  getSectionPrice,
} from "../lib/helpers.jsx";

const Booking = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [seatNames, setSeatNames] = useState([])
  const [totalAmount, setTotalAmount] = useState(0);
  // const [isLoading] = useState(true)

  const { data: tables, isLoading, error, refetch } = useTables();
  const { seatStatus, checkAvailability, isChecking } = useSeatManagement(
    selectedTable?._id
  );

  const { bookedSeats = [], lockedSeats = [] } = seatStatus || {};

  // const [tablesData] = useState(tables);
  // console.log(tablesData);
  

  useEffect(() => {
    const calculateAmount = () => {
      if (selectedSeats.length === 0) {
        setTotalAmount(0);
        return;
      }

      const pricePerSeat = parseInt(
        getSectionPrice(selectedTable?.type).replace(/[₦,]/g, "")
      );

      const amount = selectedSeats.length * pricePerSeat;
      setTotalAmount(amount);
    };

    calculateAmount();
  }, [selectedSeats, selectedTable?.type]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error)
    return (
      <div>
        <Error
          error={error}
          resetErrorBoundary={refetch}
          queryKey={["tables"]}
        />
      </div>
    );

    if (!tables) return <LoadingScreen />;



  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {!showCheckout && (
        <SeatSelection
        isLoading ={isLoading}
          selectedSeats={selectedSeats}
          tablesData={tables}
          setSelectedSeats={setSelectedSeats}
          setSelectedTable={setSelectedTable}
          setShowCheckout={setShowCheckout}
          bookedSeats={bookedSeats}
          lockedSeats={lockedSeats}
          checkAvailability={checkAvailability}
          isChecking={isChecking}
          totalAmount={totalAmount}
          setSeatNames={setSeatNames}
          selectedTable={selectedTable}
        />
      )}
      {showCheckout && (
        <CheckoutForm
          baseAmount={totalAmount}
          onClose={() => setShowCheckout(false)}
          selectedSeats={selectedSeats}
          selectedTable={selectedTable}
          seatNames={seatNames}
        />
      )}
    </div>
  );
};

export default Booking;
