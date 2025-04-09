import { Spinner } from "@/components/ui/spinner";

export const BoxLoader = ({ height = "h-screen" }: { height?: string }) => {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <Spinner show={true} />
    </div>
  );
};

export const BoxLoaderWrapper = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  return isLoading ? <BoxLoader height={"h-72"} /> : <>{children}</>;
};

export const TableLoader = () => {
  return (
    <div className={"w-full h-56 flex items-center justify-center"}>
      <Spinner show={true} />
    </div>
  );
};