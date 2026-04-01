'use strict';

/**
 * AuditConsole - Consola de Auditoría
 *
 * Registra y gestiona eventos de auditoría del sistema.
 * Permite registrar acciones de usuarios, consultarlas y filtrarlas.
 */
class AuditConsole {
  constructor() {
    this._logs = [];
  }

  /**
   * Registra un evento de auditoría.
   * @param {string} action - Acción realizada (p. ej. 'LOGIN', 'DELETE', 'UPDATE').
   * @param {string} user - Nombre o identificador del usuario que realizó la acción.
   * @param {Object} [details={}] - Detalles adicionales del evento.
   * @returns {Object} El registro de auditoría creado.
   */
  log(action, user, details = {}) {
    if (!action || typeof action !== 'string') {
      throw new Error('La acción es requerida y debe ser una cadena de texto.');
    }
    if (!user || typeof user !== 'string') {
      throw new Error('El usuario es requerido y debe ser una cadena de texto.');
    }

    const entry = {
      id: this._logs.length + 1,
      action,
      user,
      details,
      timestamp: new Date().toISOString(),
    };

    this._logs.push(entry);
    return entry;
  }

  /**
   * Retorna todos los registros de auditoría.
   * @returns {Object[]} Copia del arreglo de registros.
   */
  getLogs() {
    return [...this._logs];
  }

  /**
   * Filtra registros por usuario.
   * @param {string} user - Nombre o identificador del usuario.
   * @returns {Object[]} Registros pertenecientes al usuario.
   */
  getLogsByUser(user) {
    return this._logs.filter((entry) => entry.user === user);
  }

  /**
   * Filtra registros por acción.
   * @param {string} action - Tipo de acción.
   * @returns {Object[]} Registros con la acción indicada.
   */
  getLogsByAction(action) {
    return this._logs.filter((entry) => entry.action === action);
  }

  /**
   * Retorna el número total de registros almacenados.
   * @returns {number}
   */
  count() {
    return this._logs.length;
  }

  /**
   * Elimina todos los registros de auditoría.
   */
  clear() {
    this._logs = [];
  }
}

module.exports = AuditConsole;
