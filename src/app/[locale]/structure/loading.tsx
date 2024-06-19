import Loading from "@/shared/components/Loading";

export default async function ContentLoading() {
  return (
    <div className="absolute top-4 left-1/2 z-10">
      <Loading />
    </div>
  );
}
