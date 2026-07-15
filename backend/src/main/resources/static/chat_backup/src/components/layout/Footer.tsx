export default function Footer() {
  return (
    <footer className="w-full bg-primary-container border-t border-on-primary-fixed-variant/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-lg max-w-screen-2xl mx-auto gap-gutter">
        <div className="font-headline-sm text-headline-sm font-bold text-on-primary-container mb-4 md:mb-0">
          LuxeAuction
        </div>
        <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
          {["Terms of Service", "Privacy Policy", "Bidding Rules", "Contact Us", "Careers"].map((link) => (
            <a
              key={link}
              href="#"
              className="font-label-sm text-label-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="font-body-md text-body-md text-on-primary-container/80 text-center md:text-right">
          © 2024 LuxeAuction. High-Stakes Precision Bidding.
        </div>
      </div>
    </footer>
  );
}
