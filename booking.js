// This will store all bookings
const confirmed_bookings = [];
const pending_bookings = [];
function chkValidEntry(element){
        return /^[A-D](10|[1-5])$/.test(element);
}

function chkAvailability(seatID, seat_array){
    seatObjFound = seat_array.find((so) => so.id === seatID);
    return (seatObjFound.status == "available");
}

function confirmBooking(seatID, seat_array){
        seat_array.forEach(seatToConfirm => {
                        if(seatToConfirm.id === seatID){
                            seatToConfirm.status = "booked";


                            return true;
                        }
                        else{
                            return false;
                        }
        });
}
module.exports = {confirmed_bookings, pending_bookings, chkValidEntry, chkAvailability, confirmBooking};
