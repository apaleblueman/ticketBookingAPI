// This will store all bookings
const bookings = [];

function chkValidEntry(element){
        return /^[A-D](10|[1-9])$/.test(element);
}
module.exports = {bookings, chkValidEntry};
