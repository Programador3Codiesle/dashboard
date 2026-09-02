export function CcQueryError({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
      {message}
    </p>
  );
}
