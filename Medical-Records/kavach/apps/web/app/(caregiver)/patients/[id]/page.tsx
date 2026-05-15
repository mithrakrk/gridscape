type Props = { params: { id: string } };
export default function PatientDetailPage({ params }: Props) {
  return <div><h1>Patient {params.id}</h1></div>;
}