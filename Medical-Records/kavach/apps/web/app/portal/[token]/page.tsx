// Portal page scoped to a specific access token
type Props = { params: { token: string } };
export default function PortalTokenPage({ params }: Props) {
  // Redirect to portal page with token, or render inline
  return <div>Portal for token: {params.token}</div>;
}