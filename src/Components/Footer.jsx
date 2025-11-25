const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-8 px-8 mt-auto w-full">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} MyProducts. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
