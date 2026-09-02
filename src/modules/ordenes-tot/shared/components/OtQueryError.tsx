export function OtQueryError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </p>
  );
}
