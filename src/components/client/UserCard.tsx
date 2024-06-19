import "@radix-ui/themes/styles.css";
import { Box, Heading, HoverCard, Theme, Text, Button } from "@radix-ui/themes";
import ConfirmationDialog from "./ConfirmationDialog";
import { getElements } from "./UserCardElements";
import { HierarchyContext } from "@/components/contexts/hierarchyContext";
import { IUser } from "@/shared/interfaces/iUser";
import Loading from "@/shared/components/Loading";
import Photo from "./Photo";
import { PanelContext } from "@/components/contexts/panelContext";
import React, {
  ForwardedRef,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { removeFromCache } from "@/actions/formAction.add";
import { SidePanelActions } from "../enums/sidePanelActions";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

const UserCard = ({
  activate,
  children,
  refPhoto,
  user,
}: {
  activate: boolean;
  children: ReactNode;
  refPhoto: ForwardedRef<HTMLImageElement>;
  user: IUser;
}) => {
  const pathname = usePathname();
  const refForm = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();
  const { userCardAttributes, isMockup, cacheUseDatabase } =
    useContext(HierarchyContext);
  const {
    canAddToSharepointList,
    canManageAzureAccounts,
    isSharepointEnabled,
  } = useContext(PanelContext);
  const [isDarkMode, setIsDarkMode] = useState(Utils.isDarkMode());
  const {
    //isOpen: isPanelOpen,
    setIsOpen: setIsPanelOpen,
    setManager,
    setPanelAction,
  } = useContext(PanelContext);

  const [isSubmitting, setIsSubmitting] = useState(false);
  useMemo(() => {
    if (!activate || !userCardAttributes) {
      const observer = Utils.addMutationObserver(() =>
        setIsDarkMode(Utils.isDarkMode())
      );
      return () => observer.disconnect();
    }
  }, [activate, userCardAttributes]);

  if (!activate || !userCardAttributes) {
    return (
      <Theme className="!z-auto" appearance={isDarkMode ? "dark" : "inherit"}>
        {children}
      </Theme>
    );
  }
  const ui = getElements({ user, userCardAttributes, translations: t });

  const canAddNewEmployees =
    (!isMockup && isSharepointEnabled && canAddToSharepointList) ||
    canManageAzureAccounts;
  const canRemoveFromCache =
    user.isDirty && cacheUseDatabase && canManageAzureAccounts;

  return (
    <Theme className="!max-h-fit" appearance={isDarkMode ? "dark" : "inherit"}>
      <HoverCard.Root>
        <HoverCard.Trigger>{children}</HoverCard.Trigger>
        <HoverCard.Content className="!w-[50vw] tablet:!w-[70vw]">
          <div className="flex justify-between tablet:flex-col tablet:gap-2">
            <div className="flex gap-4">
              <div className="tablet:hidden">
                <Photo
                  existingRefPhoto={refPhoto}
                  user={user}
                  loadPhoto={!isMockup}
                />
              </div>
              <Box className="!text-wrap !max-w-[25vw] tablet:!max-w-[70vw] !break-all">
                <Heading size="3" as="h3">
                  {ui.first}
                </Heading>
                <Text as="div" size="2" color="gray" mb="2">
                  {ui.second}
                </Text>
                <Text as="div" size="2">
                  {ui.third}
                  {ui.third && ui.fourth ? `, ${ui.fourth}` : undefined}
                </Text>
              </Box>
            </div>
            <form
              ref={refForm}
              action={() =>
                removeFromCache(user.id, pathname || location.pathname)
              }
              onSubmit={() => setIsSubmitting(true)}
            >
              <div className="flex flex-col gap-1">
                {canAddNewEmployees ? (
                  <Button
                    type="button"
                    className="!w-auto !whitespace-nowrap"
                    onClick={() => {
                      setManager(user);
                      setIsPanelOpen(true);
                      setPanelAction(SidePanelActions.createEmployee);
                    }}
                  >
                    {t("createNewEmployee")}
                  </Button>
                ) : null}
                {canAddNewEmployees && canManageAzureAccounts ? (
                  <Button
                    type="button"
                    className="!w-auto !whitespace-nowrap"
                    onClick={() => {
                      setManager(user);
                      setIsPanelOpen(true);
                      setPanelAction(SidePanelActions.updateEmployee);
                    }}
                  >
                    {t("updateEmployee")}
                  </Button>
                ) : null}
                {canAddNewEmployees ? (
                  <Button
                    type="button"
                    className="!w-auto !whitespace-nowrap"
                    onClick={() => {
                      setManager(user);
                      setIsPanelOpen(true);
                      setPanelAction(SidePanelActions.offboardEmployee);
                    }}
                  >
                    {t("offboardEmployee")}
                  </Button>
                ) : null}
                {canRemoveFromCache ? (
                  !isSubmitting ? (
                    <ConfirmationDialog
                      confirmedAction={() => refForm.current?.requestSubmit()}
                      bodyText={""}
                      buttonTextConfirm={t("confirm")}
                      buttonTextCancel={t("cancel")}
                      headerText={`${t("removeFromCache")}?`}
                    >
                      <Button
                        type="button"
                        className="!w-[100%] !whitespace-nowrap"
                      >
                        {t("removeFromCache")}
                      </Button>
                    </ConfirmationDialog>
                  ) : (
                    <Loading />
                  )
                ) : null}
              </div>
            </form>
          </div>
          {ui.attributes.length > 5 ? (
            <div className="grid grip-col-2 gap-2 mt-3">
              {ui.attributes.slice(4)}
            </div>
          ) : null}
        </HoverCard.Content>
      </HoverCard.Root>
    </Theme>
  );
};

export default UserCard;
