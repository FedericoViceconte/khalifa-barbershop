import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icono from '../components/Icono';
import { cancelarTurno, consultarTurno } from '../api';
import { capitalizar, fechaLarga, pesos, useTitulo } from '../formato';

const ESTADOS = {
  reservado: 'Reservado',
  completado: 'Atendido',
  ausente: 'No asistió',
  cancelado: 'Cancelado'
};

const MiTurno = () => {
  useTitulo('Mi turno');
  const [params] = useSearchParams();
  const [form, setForm] = useState({ codigo: (params.get('codigo') ?? '').slice(0, 6).toUpperCase(), telefono: '' });
  const [turno, setTurno] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setForm((previo) => ({ ...previo, [name]: name === 'codigo' ? value.toUpperCase() : value }));
  };

  const ejecutar = async (accion) => {
    setError('');
    setAviso('');
    setOcupado(true);
    try {
      await accion();
    } catch (falla) {
      setError(falla.message);
    } finally {
      setOcupado(false);
      setConfirmando(false);
    }
  };

  const consultar = (e) => {
    e.preventDefault();
    setTurno(null);
    ejecutar(async () => setTurno(await consultarTurno(form)));
  };

  const cancelar = () =>
    ejecutar(async () => {
      const respuesta = await cancelarTurno(form);
      setTurno(respuesta.turno);
      setAviso(respuesta.message);
    });

  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Mi turno</p>
        <h1>Consultá o cancelá tu turno</h1>
        <p>Ingresá el código que recibiste al reservar y el teléfono que usaste.</p>
      </header>

      <div className="contenedor mi-turno">
        <form className="tarjeta formulario" onSubmit={consultar}>
          <label>Código de turno
            <input
              name="codigo"
              value={form.codigo}
              onChange={cambiar}
              maxLength={6}
              minLength={6}
              pattern="[A-Za-z0-9]{6}"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="campo-codigo"
              placeholder="ABC234"
              required
            />
          </label>
          <label>Teléfono
            <input name="telefono" type="tel" value={form.telefono} onChange={cambiar} autoComplete="tel" maxLength={30} required />
          </label>
          <button type="submit" className="boton boton-primario" disabled={ocupado}>
            {ocupado && !turno ? 'Buscando…' : 'Buscar mi turno'}
          </button>
          {error && <p className="mensaje-error" role="alert">{error}</p>}
        </form>

        {turno ? (
          <section className="tarjeta turno-encontrado" aria-labelledby="titulo-turno" aria-live="polite">
            <div className="turno-encabezado">
              <h2 id="titulo-turno">Turno {turno.codigo}</h2>
              <span className={`insignia insignia-${turno.estado}`}>{ESTADOS[turno.estado] ?? turno.estado}</span>
            </div>
            {aviso && <p className="mensaje-exito" role="status">{aviso}</p>}
            <dl className="detalle-turno">
              <div><dt>Servicio</dt><dd>{turno.servicio}</dd></div>
              <div><dt>Barbero</dt><dd>{turno.barbero}</dd></div>
              <div><dt>Día</dt><dd>{capitalizar(fechaLarga(turno.fecha))}</dd></div>
              <div><dt>Hora</dt><dd>{turno.hora} h</dd></div>
              <div><dt>Total</dt><dd>{pesos(turno.precio)}</dd></div>
            </dl>
            {turno.cancelable && !confirmando && (
              <button type="button" className="boton boton-peligro" onClick={() => setConfirmando(true)}>
                Cancelar el turno
              </button>
            )}
            {confirmando && (
              <div className="confirmar-cancelacion" role="group" aria-label="Confirmar la cancelación">
                <p>¿Seguro que querés cancelar este turno? El horario queda libre para otra persona.</p>
                <div className="botones">
                  <button type="button" className="boton boton-peligro" onClick={cancelar} disabled={ocupado}>
                    Sí, cancelar
                  </button>
                  <button type="button" className="boton boton-texto" onClick={() => setConfirmando(false)}>
                    No, mantenerlo
                  </button>
                </div>
              </div>
            )}
            {turno.estado === 'cancelado' && (
              <Link to="/reservar" className="boton boton-secundario">
                Reservar un turno nuevo <Icono nombre="flecha" medida={18} />
              </Link>
            )}
          </section>
        ) : (
          <aside className="tarjeta ayuda-turno">
            <Icono nombre="ticket" medida={28} />
            <h2>¿No tenés el código?</h2>
            <p>Lo mostramos al confirmar la reserva. Si lo perdiste, escribinos desde la página de contacto con tu nombre y el día del turno.</p>
            <Link to="/contacto" className="enlace-flecha">
              Ir a contacto <Icono nombre="flecha" medida={16} />
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
};

export default MiTurno;
