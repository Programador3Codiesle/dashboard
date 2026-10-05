export type TramoRecuperacionVisible = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

function fechaVisible(ymd: string): string {
  const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return ymd;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function RecuperacionTiempoDetalle({
  tramos,
}: {
  tramos: TramoRecuperacionVisible[];
}) {
  if (tramos.length === 0) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold brand-text">
        Recuperación del tiempo
      </h3>
      <ul className="space-y-3">
        {tramos.map((tramo, index) => (
          <li
            key={`${tramo.fecha}-${tramo.horaInicio}-${tramo.horaFin}-${index}`}
            className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3"
          >
            <div>
              <span className="text-gray-500">Fecha</span>
              <p className="font-medium text-gray-900">{fechaVisible(tramo.fecha)}</p>
            </div>
            <div>
              <span className="text-gray-500">Hora desde</span>
              <p className="font-medium text-gray-900">{tramo.horaInicio}</p>
            </div>
            <div>
              <span className="text-gray-500">Hora hasta</span>
              <p className="font-medium text-gray-900">{tramo.horaFin}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
