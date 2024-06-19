import { Cross2Icon } from "@radix-ui/react-icons";
import LevelUtils from "@/shared/lib/levelUtils";
import { DropdownMenu, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface IDropdownOption {
  text: string;
  value: string;
}

const LevelDropdown = ({
  title,
  options,
  classNameForSelectedItem,
  selectedValue,
  addOrRemoveChanges,
}: {
  title: string;
  options: IDropdownOption[];
  classNameForSelectedItem: string;
  selectedValue?: string;
  addOrRemoveChanges: () => void;
}) => {
  const [selected, setSelected] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  useEffect(() => {
    if (selectedValue) {
      setSelected(selectedValue);
      setSelectedText(
        LevelUtils.formatWithSpaces(
          selectedValue.substring(selectedValue.lastIndexOf(".") + 1)
        )
      );
    } else {
      setSelected("");
      setSelectedText("");
    }
  }, [selectedValue]);
  return (
    <div className="flex gap-5">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="soft">
            {title}
            <DropdownMenu.TriggerIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="z-20">
          {options.map((opt, index) => (
            <DropdownMenu.Item key={`${opt}${index}`}>
              <div
                onClick={() => {
                  setSelected(opt.value);
                  setSelectedText(opt.text);
                  addOrRemoveChanges();
                }}
                className="min-w-16 w-[100%]"
              >
                {opt.text}
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <div
        className={[classNameForSelectedItem, "font-semibold"].join(" ").trim()}
      >
        {selectedText}
      </div>
      <input
        className={classNameForSelectedItem}
        type="hidden"
        value={selected}
      />
      {selected ? (
        <button
          className="w-[25px] h-[25px]"
          aria-label="Close"
          onClick={() => {
            setSelected("");
            setSelectedText("");
            addOrRemoveChanges();
          }}
        >
          <Cross2Icon />
        </button>
      ) : null}
    </div>
  );
};

export default LevelDropdown;
