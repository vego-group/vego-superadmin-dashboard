import CabinetDetailIndex from "@/components/dashboard/cabinets/battery-swapping/detail/index";

export default async function CabinetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CabinetDetailIndex cabinetId={id} />;
}