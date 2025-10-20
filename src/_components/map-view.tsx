export function MapView(props: {
  className?: string;
  location: string;
  zoom?: number;
}) {
  return (
    <iframe
      className={props.className}
      src={`https://maps.google.com/maps?hl=en&q=${encodeURI(
        props.location
      )}+(Test)&t=&z=${props.zoom ?? 14}&ie=UTF8&iwloc=B&output=embed`}
    ></iframe>
  );
}
