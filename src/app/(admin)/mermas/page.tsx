
import React from "react";
import MermasModule from "@/components/mermas/MermasModule";

export const metadata = {
  title: "Registro de Mermas | Sistema Crepería",
  description: "Control de pérdidas e insumos malogrados",
};

const MermasPage = () => {
  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Registro de Mermas</h1>
        <p className="text-sm text-gray-500">Control de desperdicios, productos vencidos y pérdidas.</p>
      </div> */}
      <div className="flex-1">
        <MermasModule />
      </div>
    </div>
  );
};

export default MermasPage;
