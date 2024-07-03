"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeModal = (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) =>
    e.target === dialogRef.current && (onClose ? onClose() : router.back());

  return (
    <dialog
      ref={dialogRef}
      onClick={closeModal}
      onClose={onClose ? onClose : router.back}
      className="backdrop:bg-black/40 rounded-md outline-none"
    >
      {children}
    </dialog>
  );
}
