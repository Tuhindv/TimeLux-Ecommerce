import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[#d4af37]/30 bg-[#080808] px-6 py-12 md:px-16"
    >
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand Information */}
        <div>
          <h2 className="text-2xl font-bold tracking-[4px] text-[#d4af37]">
            TIMELUX
          </h2>

          <p className="mt-4 max-w-xs text-sm leading-7 text-gray-400">
            Luxury in Every Second. Discover timeless watches designed
            for elegance, precision and style.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-[#d4af37]">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link to="/" className="transition hover:text-[#d4af37]">
                Home
              </Link>
            </li>
            <li>
              <Link to="/#collection" className="transition hover:text-[#d4af37]">
                Our Collection
              </Link>
            </li>
            <li>
              <Link to="/#about" className="transition hover:text-[#d4af37]">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/#contact" className="transition hover:text-[#d4af37]">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-[#d4af37]">
            Customer Support
          </h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a
                href="https://wa.me/8801311657122"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#d4af37]"
              >
                WhatsApp Support
              </a>
            </li>
            <li>
              <Link to="/cart" className="transition hover:text-[#d4af37]">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="transition hover:text-[#d4af37]">
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-[#d4af37]">
            Follow Us
          </h3>

          <p className="text-sm leading-7 text-gray-400">
            Stay connected with TimeLux for the latest collections
            and updates.
          </p>

          <a
            href="https://wa.me/8801311657122"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-lg border border-[#d4af37] px-5 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center">
        <p className="text-xs text-gray-500">
          © 2026 TimeLux. All Rights Reserved.
        </p>

        <p className="mt-2 text-xs tracking-wider text-[#d4af37]">
          LUXURY IN EVERY SECOND.
        </p>
      </div>
    </footer>
  );
}

export default Footer;