'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import { encuestasKeys } from '@/modules/encuestas/shared/constants/query-keys';
import {
  encuestaQrService,
  type VehiculoQr,
} from '@/modules/encuestas/shared/services/encuesta-qr.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';

type Step =
  | 'placa'
  | 'confirmVh'
  | 'updateOwner'
  | 'userVh'
  | 'askSurvey'
  | 'encuesta'
  | 'done';

export function EncuestaSalidaWizard() {
  const [step, setStep] = useState<Step>('placa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [placa, setPlaca] = useState('');
  const [doc, setDoc] = useState('');
  const [vh, setVh] = useState<VehiculoQr | null>(null);

  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [origMail, setOrigMail] = useState('');
  const [origPhone, setOrigPhone] = useState('');

  const [userName, setUserName] = useState('');
  const [userMail, setUserMail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userMode, setUserMode] = useState<'insert' | 'update'>('insert');

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const preguntasQuery = useQuery({
    queryKey: encuestasKeys.preguntasQr,
    queryFn: () => encuestaQrService.listarPreguntas(),
    ...transactionalQueryOptions,
  });
  const preguntas = preguntasQuery.data ?? [];

  useEffect(() => {
    const el = document.documentElement;
    if (!el.getAttribute('data-empresa')) {
      el.setAttribute('data-empresa', '1');
    }
  }, []);

  async function buscarPlaca() {
    setError('');
    if (!placa.trim() || placa.trim().length < 6) {
      setError('La placa debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const data = await encuestaQrService.buscarPlaca(placa.trim().toUpperCase());
      if (data.response !== 'success') {
        setError(
          `El vehículo de placa ${placa} no se encuentra disponible para generar la orden de salida.`,
        );
        setStep('placa');
        return;
      }
      setVh(data);
      setMail(data.mail ?? '');
      setPhone(data.celular ?? '');
      setOrigMail(data.mail ?? '');
      setOrigPhone(data.celular ?? '');
      setStep('confirmVh');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar placa');
    } finally {
      setLoading(false);
    }
  }

  async function continuarDoc() {
    setError('');
    if (!doc.trim()) {
      setError('Debe insertar el número de documento');
      return;
    }
    if (doc.trim() === String(vh?.nit_comprador ?? '')) {
      setStep('updateOwner');
      return;
    }
    setLoading(true);
    try {
      const r = await encuestaQrService.buscarNit(doc.trim(), placa.trim().toUpperCase());
      if (r.response === 'success') {
        setUserName(r.nombres ?? '');
        setUserMail(r.mail ?? '');
        setUserPhone(r.telefono ?? '');
        setUserMode('update');
      } else {
        setUserName('');
        setUserMail('');
        setUserPhone('');
        setUserMode('insert');
      }
      setStep('userVh');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar documento');
    } finally {
      setLoading(false);
    }
  }

  async function registrarUsuario() {
    setError('');
    if (!userName.trim() || !userMail.trim() || !userPhone.trim()) {
      setError('Hay campos vacíos en el formulario');
      return;
    }
    setLoading(true);
    try {
      const r = await encuestaQrService.registrarUsuario({
        inputPlacaOrden: placa.trim().toUpperCase(),
        user_nit_comprador_up: doc.trim(),
        user_nombres_up: userName.trim().toUpperCase(),
        user_email_up: userMail.trim(),
        user_celular_up: userPhone.trim(),
        opcion: userMode === 'insert' ? 0 : 1,
      });
      if (r.response !== 'success') {
        setError('No se pudo guardar la información del usuario');
        return;
      }
      setStep('askSurvey');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }

  async function actualizarPropietario() {
    setError('');
    if (!mail.trim() || !phone.trim()) {
      setError('Email y teléfono son requeridos');
      return;
    }
    if (mail === origMail && phone === origPhone) {
      setStep('askSurvey');
      return;
    }
    setLoading(true);
    try {
      const r = await encuestaQrService.actualizarTercero({
        fieldNit: String(vh?.nit_comprador ?? ''),
        fieldMailUpdate: mail.trim(),
        fieldPhoneUpdate: phone.trim(),
      });
      if (r.response !== 'success') {
        setError('No se pudieron actualizar los datos');
        return;
      }
      setStep('askSurvey');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  }

  async function sinEncuesta() {
    setLoading(true);
    setError('');
    try {
      const propietario =
        doc.trim() === String(vh?.nit_comprador ?? '') ? '1' : '0';
      const r = await encuestaQrService.sinEncuesta({
        numero: String(vh?.numero ?? ''),
        propietario,
        nit: doc.trim(),
      });
      if (r.response === 'success') {
        setMsg('Ya puedes retirar el vehículo de las instalaciones');
        setStep('done');
      } else {
        setError('Ha ocurrido un error, intente nuevamente');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function enviarEncuesta() {
    setError('');
    for (const p of preguntas) {
      if (p.tipo === 'op') continue;
      if (!answers[`pregunta${p.id}`]) {
        setError('Debe responder todas las preguntas obligatorias');
        return;
      }
    }
    setLoading(true);
    try {
      const propietario =
        doc.trim() === String(vh?.nit_comprador ?? '') ? '1' : '0';
      const body: Record<string, string> = {
        placa: placa.trim().toUpperCase(),
        bod: String(vh?.bodega ?? ''),
        numero: String(vh?.numero ?? ''),
        fieldNit: doc.trim(),
        propietario,
        bodega: String(vh?.bodega ?? ''),
        ...answers,
      };
      const r = await encuestaQrService.responder(body);
      if (r.response === 'success') {
        setMsg(
          'Gracias por contestar la encuesta, ya puedes retirar el vehículo',
        );
        setStep('done');
      } else {
        setError('Error al guardar la encuesta');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStep('placa');
    setPlaca('');
    setDoc('');
    setVh(null);
    setAnswers({});
    setError('');
    setMsg('');
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold brand-text">CODIESEL S.A.</h1>
        <p className="text-sm text-slate-600">Generar orden de salida / Encuesta de satisfacción</p>
      </div>

      {(error || preguntasQuery.isError) && (
        <div className="mb-4 rounded-md border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error ||
            getErrorMessage(preguntasQuery.error, ENCUESTAS_COPY.qr.loadError)}
        </div>
      )}

      {loading && (
        <div className="mb-4 text-center text-sm text-slate-500">Procesando...</div>
      )}

      {step === 'placa' && (
        <Card title="DIGITE LA PLACA DE SU VEHÍCULO">
          <div className="flex flex-wrap gap-2">
            <input
              className="flex-1 rounded border px-3 py-2 uppercase"
              placeholder="PLACA"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && buscarPlaca()}
            />
            <button
              type="button"
              onClick={buscarPlaca}
              className="rounded brand-bg px-4 py-2 font-medium text-white brand-bg-hover"
            >
              Buscar
            </button>
          </div>
        </Card>
      )}

      {step === 'confirmVh' && vh && (
        <Card title="INFORMACIÓN DEL VEHÍCULO">
          <div className="mb-4 rounded border border-[color-mix(in_srgb,var(--color-warning)_40%,white)] bg-[var(--color-warning-soft)] p-3 text-sm">
            <p>
              <strong>Placa:</strong> {vh.placa}
            </p>
            <p>
              <strong>Marca:</strong> {vh.marca}
            </p>
            <p>
              <strong>Modelo:</strong> {vh.des_modelo}
            </p>
            <p>
              <strong>Color:</strong> {vh.color}
            </p>
            <p>
              <strong>Orden:</strong> {vh.numero}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Si la información es correcta digite su número de documento y continúe.
            </p>
          </div>
          <label className="block text-sm">
            N° de documento
            <input
              type="number"
              className="mt-1 w-full rounded border px-3 py-2"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={continuarDoc}
            className="mt-3 rounded brand-bg px-4 py-2 text-sm font-medium text-white brand-bg-hover"
          >
            Continuar
          </button>
        </Card>
      )}

      {step === 'updateOwner' && (
        <Card title="ACTUALIZAR DATOS PERSONALES">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Nombre
              <input
                readOnly
                className="mt-1 w-full rounded border bg-slate-100 px-3 py-2"
                value={vh?.nombres ?? ''}
              />
            </label>
            <label className="text-sm">
              Email *
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Celular *
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={actualizarPropietario}
              className="rounded brand-bg px-4 py-2 text-sm font-medium text-white brand-bg-hover"
            >
              Actualizar / Continuar
            </button>
            <button
              type="button"
              onClick={() => setStep('askSurvey')}
              className="rounded bg-[var(--color-warning)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Continuar sin cambios
            </button>
          </div>
        </Card>
      )}

      {step === 'userVh' && (
        <Card title="DATOS DEL USUARIO DEL VEHÍCULO">
          <div className="grid gap-3">
            <label className="text-sm">
              Nombre *
              <input
                className="mt-1 w-full rounded border px-3 py-2 uppercase"
                value={userName}
                onChange={(e) => setUserName(e.target.value.toUpperCase())}
                readOnly={userMode === 'update'}
              />
            </label>
            <label className="text-sm">
              Correo electrónico *
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={userMail}
                onChange={(e) => setUserMail(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Teléfono o celular *
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={registrarUsuario}
            className="mt-3 rounded brand-success px-4 py-2 text-sm font-medium text-white brand-success-hover"
          >
            {userMode === 'insert' ? 'Registrar' : 'Actualizar'}
          </button>
        </Card>
      )}

      {step === 'askSurvey' && (
        <Card title="¿Desea realizar la Encuesta de satisfacción?">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep('encuesta')}
              className="rounded brand-success px-4 py-2 text-sm font-medium text-white brand-success-hover"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={sinEncuesta}
              className="rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white"
            >
              No
            </button>
          </div>
        </Card>
      )}

      {step === 'encuesta' && (
        <Card title="Encuesta de satisfacción CODIESEL S.A">
          <p className="mb-4 text-center text-xs italic text-slate-500">
            Elija el estado que represente su nivel de satisfacción con el servicio
          </p>
          <div className="space-y-4">
            {preguntas.map((p) => (
              <div
                key={p.id}
                className="rounded border border-[color-mix(in_srgb,var(--color-info)_35%,white)] p-3 text-sm"
              >
                <p className="mb-2 font-medium">{p.pregunta}:</p>
                {p.tipo === '1-10' && p.id === 1 && (
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        v: '6',
                        label: '0-6',
                        cls: 'border-[var(--color-danger)] text-[var(--color-danger)]',
                      },
                      {
                        v: '8',
                        label: '7-8',
                        cls: 'border-[var(--color-warning)] text-[var(--color-warning)]',
                      },
                      {
                        v: '10',
                        label: '9-10',
                        cls: 'border-[var(--color-success)] text-[var(--color-success)]',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        className={`rounded border-2 px-3 py-2 ${opt.cls} ${
                          answers[`pregunta${p.id}`] === opt.v
                            ? 'bg-slate-100 font-bold'
                            : ''
                        }`}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [`pregunta${p.id}`]: opt.v }))
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {p.tipo === 'sn' && (
                  <div className="flex gap-2">
                    {['NO', 'SI'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`rounded border px-4 py-2 ${
                          answers[`pregunta${p.id}`] === opt
                            ? 'bg-[var(--color-info)] text-white'
                            : 'bg-white'
                        }`}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [`pregunta${p.id}`]: opt }))
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {p.tipo === 'op' && (
                  <textarea
                    rows={4}
                    className="w-full rounded border px-3 py-2"
                    placeholder="Escriba aquí su opinión acerca del servicio prestado"
                    value={answers[`pregunta${p.id}`] ?? ''}
                    onChange={(e) =>
                      setAnswers((a) => ({
                        ...a,
                        [`pregunta${p.id}`]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={enviarEncuesta}
            className="mt-4 rounded brand-bg px-4 py-2 text-sm font-medium text-white brand-bg-hover"
          >
            Enviar Respuestas
          </button>
        </Card>
      )}

      {step === 'done' && (
        <Card title="Listo">
          <p className="text-center text-[var(--color-success)]">{msg}</p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-4 rounded brand-bg px-4 py-2 text-sm font-medium text-white brand-bg-hover"
          >
            Nueva encuesta
          </button>
        </Card>
      )}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">
        {title}
      </h2>
      {children}
    </div>
  );
}
