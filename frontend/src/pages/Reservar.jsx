import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SERVICIOS,
  BARBEROS,
  buscarServicio,
  buscarBarbero,
  fechasReservables,
  ahoraEnArgentina
} from '../../../shared/agenda.mjs';
import Icono from '../components/Icono';
import { getDisponibilidad, reservarTurno } from '../api';
import { descargarIcs } from '../calendario';
import { DIRECCION } from '../datos';
import { capitalizar, fechaLarga, partesDeFecha, pesos, useTitulo } from '../formato';

const SIN_PREFERENCIA = { id: 'cualquiera', nombre: 'Sin preferencia', detalle: 'Te asignamos al barbero que esté libre.' };
const datosVacios = { nombre: '', telefono: '', email: '', notas: '' };

const Reservar = () => {
  useTitulo('Reservar turno');
  const [params] = useSearchParams();
  const dias = useMemo(() => fechasReservables(ahoraEnArgentina()), []);

  const [servicio, setServicio] = useState(buscarServicio(params.get('servicio'))?.id ?? '');
  const [barbero, setBarbero] = useState(buscarBarbero(params.get('barbero'))?.id ?? 'cualquiera');
  const [fecha, setFecha] = useState(dias.find((dia) => dia.conLugar)?.fecha ?? '');
  const [hora, setHora] = useState('');
  const [horarios, setHorarios] = useState({ cargando: false, error: '', lista: [] });
  const [datos, setDatos] = useState(datosVacios);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [turno, setTurno] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const confirmacion = useRef(null);

  useEffect(() => {
    if (!servicio || !fecha) return undefined;
    let vigente = true;
    setHorarios((previo) => ({ ...previo, cargando: true, error: '' }));
    getDisponibilidad({ fecha, servicio, barbero })
      .then(({ horarios: lista }) => {
        if (!vigente) return;
        setHorarios({ cargando: false, error: '', lista });
        setHora((actual) => (lista.includes(actual) ? actual : ''));
      })
      .catch((falla) => vigente && setHorarios({ cargando: false, error: falla.message, lista: [] }));
    return () => {
      vigente = false;
    };
  }, [servicio, barbero, fecha, recarga]);

  useEffect(() => {
    if (!turno) return;
    window.scrollTo({ top: 0 });
    confirmacion.current?.focus({ preventScroll: true });
  }, [turno]);

  const elegido = buscarServicio(servicio);
  const listo = Boolean(elegido && fecha && hora);

  const cambiar = (e) => setDatos((previos) => ({ ...previos, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    if (!listo) return;
    setError('');
    setEnviando(true);
    try {
      setTurno(await reservarTurno({ servicio, barbero, fecha, hora, ...datos }));
    } catch (falla) {
      setError(falla.message);
      setRecarga((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setTurno(null);
    setHora('');
    setDatos(datosVacios);
    setRecarga((n) => n + 1);
  };

  if (turno) {
    return (
      <main id="contenido" className="pagina">
        <section className="contenedor confirmacion tarjeta" aria-labelledby="titulo-confirmado" tabIndex={-1} ref={confirmacion}>
          <span className="confirmacion-icono" aria-hidden="true">
            <Icono nombre="check" medida={34} />
          </span>
          <h1 id="titulo-confirmado">¡Turno reservado!</h1>
          <p>Guardá este código: lo vas a necesitar para consultar o cancelar el turno.</p>
          <p className="codigo-turno" aria-label={`Código de turno ${turno.codigo.split('').join(' ')}`}>
            {turno.codigo}
          </p>
          <dl className="detalle-turno">
            <div><dt>Servicio</dt><dd>{turno.servicio}</dd></div>
            <div><dt>Barbero</dt><dd>{turno.barbero}</dd></div>
            <div><dt>Día</dt><dd>{capitalizar(fechaLarga(turno.fecha))}</dd></div>
            <div><dt>Hora</dt><dd>{turno.hora} h</dd></div>
            <div><dt>Total</dt><dd>{pesos(turno.precio)}</dd></div>
          </dl>
          <div className="botones">
            <button type="button" className="boton boton-primario" onClick={() => descargarIcs(turno, DIRECCION)}>
              <Icono nombre="calendario" medida={18} /> Agregar al calendario
            </button>
            <Link to={`/mi-turno?codigo=${turno.codigo}`} className="boton boton-secundario">
              Ver mi turno
            </Link>
            <button type="button" className="boton boton-texto" onClick={reiniciar}>
              Reservar otro turno
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Turnos online</p>
        <h1>Reservá tu turno</h1>
        <p>Elegí el servicio, el barbero y el horario que te queden cómodos. Te confirmamos al instante.</p>
      </header>

      <div className="contenedor reserva">
        <form className="reserva-pasos" onSubmit={enviar}>
          <fieldset className="paso">
            <legend><span className="paso-numero">1</span> Servicio</legend>
            <div className="opciones opciones-servicio">
              {SERVICIOS.map((opcion) => (
                <label key={opcion.id} className="opcion">
                  <input type="radio" name="servicio" value={opcion.id} checked={servicio === opcion.id} onChange={() => setServicio(opcion.id)} required />
                  <span className="opcion-cuerpo">
                    <Icono nombre={opcion.id} />
                    <strong>{opcion.nombre}</strong>
                    <small>{opcion.duracion} min · {pesos(opcion.precio)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="paso">
            <legend><span className="paso-numero">2</span> Barbero</legend>
            <div className="opciones opciones-barbero">
              {[SIN_PREFERENCIA, ...BARBEROS].map((opcion) => (
                <label key={opcion.id} className="opcion">
                  <input type="radio" name="barbero" value={opcion.id} checked={barbero === opcion.id} onChange={() => setBarbero(opcion.id)} />
                  <span className="opcion-cuerpo">
                    <Icono nombre={opcion.id === 'cualquiera' ? 'persona' : opcion.id === 'clasica' ? 'afeitado' : 'corte'} />
                    <strong>{opcion.nombre}</strong>
                    <small>{opcion.detalle}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="paso">
            <legend><span className="paso-numero">3</span> Día y horario</legend>
            <div className="dias">
              {dias.map(({ fecha: dia, abierto }) => {
                const partes = partesDeFecha(dia);
                return (
                  <label key={dia} className={`dia${abierto ? '' : ' dia-cerrado'}`}>
                    <input
                      type="radio"
                      name="fecha"
                      value={dia}
                      checked={fecha === dia}
                      disabled={!abierto}
                      onChange={() => setFecha(dia)}
                      aria-label={`${capitalizar(fechaLarga(dia))}${abierto ? '' : ', cerrado'}`}
                    />
                    <span className="dia-cuerpo" aria-hidden="true">
                      <small>{partes.dia}</small>
                      <strong>{partes.numero}</strong>
                      <small>{abierto ? partes.mes : 'cerrado'}</small>
                    </span>
                  </label>
                );
              })}
            </div>

            {!servicio ? (
              <p className="tenue">Elegí un servicio para ver los horarios libres.</p>
            ) : horarios.cargando ? (
              <p className="tenue" role="status">Buscando horarios…</p>
            ) : horarios.error ? (
              <p className="mensaje-error" role="alert">{horarios.error}</p>
            ) : horarios.lista.length === 0 ? (
              <p className="tenue">No quedan horarios libres este día. Probá con otra fecha{barbero !== 'cualquiera' ? ' o con otro barbero' : ''}.</p>
            ) : (
              <div className="horarios">
                {horarios.lista.map((opcion) => (
                  <label key={opcion} className="horario">
                    <input type="radio" name="hora" value={opcion} checked={hora === opcion} onChange={() => setHora(opcion)} required />
                    <span>{opcion}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="paso">
            <legend><span className="paso-numero">4</span> Tus datos</legend>
            <div className="campos">
              <label><span>Nombre y apellido</span>
                <input name="nombre" value={datos.nombre} onChange={cambiar} autoComplete="name" maxLength={120} minLength={2} required />
              </label>
              <label><span>Teléfono</span>
                <input name="telefono" type="tel" value={datos.telefono} onChange={cambiar} autoComplete="tel" maxLength={30} placeholder="11 2345-6789" required />
              </label>
              <label><span>Correo <span className="tenue">(opcional)</span></span>
                <input name="email" type="email" value={datos.email} onChange={cambiar} autoComplete="email" maxLength={254} />
              </label>
              <label className="campo-completo"><span>¿Algo que debamos saber? <span className="tenue">(opcional)</span></span>
                <textarea name="notas" value={datos.notas} onChange={cambiar} maxLength={500} rows={3} placeholder="Por ejemplo: corte con tijera, sin máquina." />
              </label>
            </div>
          </fieldset>

          {error && <p className="mensaje-error" role="alert">{error}</p>}
          <button type="submit" className="boton boton-primario boton-grande" disabled={!listo || enviando}>
            {enviando ? 'Reservando…' : 'Confirmar reserva'}
          </button>
        </form>

        <aside className="resumen tarjeta" aria-label="Resumen de la reserva">
          <h2>Tu turno</h2>
          <dl>
            <div><dt>Servicio</dt><dd>{elegido ? elegido.nombre : <span className="tenue">Sin elegir</span>}</dd></div>
            <div><dt>Barbero</dt><dd>{(buscarBarbero(barbero) ?? SIN_PREFERENCIA).nombre}</dd></div>
            <div><dt>Día</dt><dd>{fecha ? capitalizar(fechaLarga(fecha)) : <span className="tenue">Sin elegir</span>}</dd></div>
            <div><dt>Hora</dt><dd>{hora ? `${hora} h` : <span className="tenue">Sin elegir</span>}</dd></div>
            {elegido && <div><dt>Duración</dt><dd>{elegido.duracion} minutos</dd></div>}
          </dl>
          <p className="resumen-total">
            <span>Total</span>
            <strong>{elegido ? pesos(elegido.precio) : '—'}</strong>
          </p>
          <p className="tenue resumen-nota">Se abona en el local. Podés cancelar desde la web hasta una hora antes.</p>
        </aside>
      </div>
    </main>
  );
};

export default Reservar;
