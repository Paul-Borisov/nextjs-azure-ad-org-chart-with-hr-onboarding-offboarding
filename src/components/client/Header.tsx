import Locales from "@/shared/components/Locales";
import { LoginButton } from "./LoginButton";
import { Navigation } from "@/shared/components/Navigation";
import Print from "./Print";
import ThemeSwitch from "./ThemeSwitch";
import SearchBox from "./SearchBox";
import useThemeMutationObserver from "@/shared/hooks/useThemeMutationObserver";

const Header = () => {
  const isDarkMode = useThemeMutationObserver();

  return (
    <header
      className={[
        "fixed flex w-screen justify-between items-center print:hidden z-10",
        isDarkMode ? "bg-black" : "bg-white", // Regular bg-white dark:bg-black does not work here; this is a workaround.
      ]
        .join(" ")
        .trim()}
    >
      <nav className="self-center flex gap-5 p-3 tablet:block tablet:pt-0">
        <Navigation />
        <SearchBox />
      </nav>
      <div className="flex gap-x-3 justify-end items-baseline p-1 tablet:block">
        <div className="self-center pr-10 tablet:hidden">
          <Print />
        </div>
        <div className="self-center pr-10 pt-1 tablet:inline-block">
          <ThemeSwitch />
        </div>
        <nav className="pr-5 self-center tablet:inline-block">
          <Locales />
        </nav>
        <div className="self-center flex gap-x-3 w-60 tablet:text-xs whitespace-nowrap">
          <LoginButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
