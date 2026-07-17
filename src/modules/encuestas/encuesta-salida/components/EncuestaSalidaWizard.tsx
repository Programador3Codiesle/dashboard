'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  encuestaQrService,
  type PreguntaQr,
  type VehiculoQr,
} from '@/modules/encuestas/shared/services/encuesta-qr.service';

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

  const [preguntas, setPreguntas] = useState<PreguntaQr[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    encuestaQrService
      .listarPreguntas()
      .then(setPreguntas)
      .catch(() => setError('No se pudieron cargar las preguntas'));
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
        <h1 className="text-2xl font-bold text-amber-700">CODIESEL S.A.</h1>
        <p className="text-sm text-slate-600">Generar orden de salida / Encuesta de satisfacción</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
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
              className="rounded bg-amber-500 px-4 py-2 font-medium text-white"
            >
              Buscar
            </button>
          </div>
        </Card>
      )}

      {step === 'confirmVh' && vh && (
        <Card title="INFORMACIÓN DEL VEHÍCULO">
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
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
            className="mt-3 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white"
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
              className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white"
            >
              Actualizar / Continuar
            </button>
            <button
              type="button"
              onClick={() => setStep('askSurvey')}
              className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white"
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
            className="mt-3 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
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
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
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
                className="rounded border border-sky-200 p-3 text-sm"
              >
                <p className="mb-2 font-medium">{p.pregunta}:</p>
                {p.tipo === '1-10' && p.id === 1 && (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: '6', label: '0-6', cls: 'border-red-400 text-red-700' },
                      { v: '8', label: '7-8', cls: 'border-amber-400 text-amber-700' },
                      { v: '10', label: '9-10', cls: 'border-emerald-400 text-emerald-700' },
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
                            ? 'bg-sky-600 text-white'
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
            className="mt-4 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white"
          >
            Enviar Respuestas
          </button>
        </Card>
      )}

      {step === 'done' && (
        <Card title="Listo">
          <p className="text-center text-emerald-700">{msg}</p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-4 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white"
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
