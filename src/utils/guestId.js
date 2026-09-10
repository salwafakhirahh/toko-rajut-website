export const getGuestId = () => {
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = '00000000-0000-0000-0000-000000000000';
    localStorage.setItem('guest_id', guestId);
  }
  return guestId;
};