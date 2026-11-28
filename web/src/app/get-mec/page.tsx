import { GetMecView } from "@/components/GetMecView";

export const metadata = { title: "Get test MEC" };

export default function GetMecPage() {
  return (
    <>
      <div className="band" aria-hidden="true" />
      <div className="wrap narrow lift-up">
        <GetMecView />
      </div>
    </>
  );
}