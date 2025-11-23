import React, { createContext, useContext, useState, ReactNode } from "react";

export interface DiscountContextType {
  appliedDiscount: {
    code: string;
    discount: number;
  } | null;
  setAppliedDiscount: (
    discount: { code: string; discount: number } | null
  ) => void;
}

const DiscountContext = createContext<DiscountContextType | undefined>(
  undefined
);

export const DiscountProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  return (
    <DiscountContext.Provider
      value={{
        appliedDiscount,
        setAppliedDiscount,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = (): DiscountContextType => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error("useDiscount must be used within a DiscountProvider");
  }
  return context;
};
