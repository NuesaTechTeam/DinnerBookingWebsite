import { Sling as HamburgerMain } from "hamburger-react";

const Hamburger = ({ mobileMenu, setMobileMenu }) => {
  return (
    <div className='md:hidden '>
      <HamburgerMain toggled={mobileMenu} toggle={setMobileMenu} size={24} />
    </div>
  );
};
export default Hamburger;
