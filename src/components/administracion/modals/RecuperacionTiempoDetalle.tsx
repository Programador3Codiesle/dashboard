export type TramoRecuperacionVisible = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
};

/** Misma fecha del correo y de la base: YYYY-MM-DD, sin correr el día. */
export function fechaYmdVisible(valor: string): string {
  const texto = valor.trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return texto;
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
              <p className="font-medium text-gray-900">{fechaYmdVisible(tramo.fecha)}</p>
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
