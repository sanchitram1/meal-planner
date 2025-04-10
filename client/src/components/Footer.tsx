import { useIsMobile } from "@/hooks/use-mobile";

export function Footer() {
  const isMobile = useIsMobile();
  
  // For mobile, make footer smaller to save space
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <p className="text-center text-xs sm:text-sm text-gray-500">
          {isMobile ? "Meal Prep; " + new Date().getFullYear() : "Meal Prep Recipe & Meal Planning App; " + new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
