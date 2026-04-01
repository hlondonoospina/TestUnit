'use strict';

const AuditConsole = require('../AuditConsole');

describe('AuditConsole - Consola de Auditoría', () => {
  let auditConsole;

  beforeEach(() => {
    auditConsole = new AuditConsole();
  });

  // ---------------------------------------------------------------
  // log()
  // ---------------------------------------------------------------
  describe('log()', () => {
    it('debe registrar un evento con acción y usuario', () => {
      const entry = auditConsole.log('LOGIN', 'user1');

      expect(entry).toBeDefined();
      expect(entry.action).toBe('LOGIN');
      expect(entry.user).toBe('user1');
    });

    it('debe asignar un id autoincremental a cada registro', () => {
      const first = auditConsole.log('LOGIN', 'user1');
      const second = auditConsole.log('LOGOUT', 'user1');

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
    });

    it('debe incluir un timestamp con formato ISO 8601', () => {
      const entry = auditConsole.log('CREATE', 'admin');

      expect(entry.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('debe almacenar los detalles adicionales del evento', () => {
      const details = { resource: 'invoice', resourceId: 42 };
      const entry = auditConsole.log('UPDATE', 'admin', details);

      expect(entry.details).toEqual(details);
    });

    it('debe usar un objeto vacío como detalles por defecto', () => {
      const entry = auditConsole.log('DELETE', 'user2');

      expect(entry.details).toEqual({});
    });

    it('debe lanzar error si la acción está ausente', () => {
      expect(() => auditConsole.log('', 'user1')).toThrow(
        'La acción es requerida y debe ser una cadena de texto.'
      );
    });

    it('debe lanzar error si la acción no es una cadena', () => {
      expect(() => auditConsole.log(123, 'user1')).toThrow(
        'La acción es requerida y debe ser una cadena de texto.'
      );
    });

    it('debe lanzar error si el usuario está ausente', () => {
      expect(() => auditConsole.log('LOGIN', '')).toThrow(
        'El usuario es requerido y debe ser una cadena de texto.'
      );
    });

    it('debe lanzar error si el usuario no es una cadena', () => {
      expect(() => auditConsole.log('LOGIN', null)).toThrow(
        'El usuario es requerido y debe ser una cadena de texto.'
      );
    });
  });

  // ---------------------------------------------------------------
  // getLogs()
  // ---------------------------------------------------------------
  describe('getLogs()', () => {
    it('debe retornar un arreglo vacío cuando no hay registros', () => {
      expect(auditConsole.getLogs()).toEqual([]);
    });

    it('debe retornar todos los registros almacenados', () => {
      auditConsole.log('LOGIN', 'user1');
      auditConsole.log('UPDATE', 'user2');

      const logs = auditConsole.getLogs();

      expect(logs).toHaveLength(2);
      expect(logs[0].action).toBe('LOGIN');
      expect(logs[1].action).toBe('UPDATE');
    });

    it('debe retornar una copia del arreglo (no la referencia interna)', () => {
      auditConsole.log('LOGIN', 'user1');

      const logs = auditConsole.getLogs();
      logs.push({ fake: true });

      expect(auditConsole.getLogs()).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // getLogsByUser()
  // ---------------------------------------------------------------
  describe('getLogsByUser()', () => {
    beforeEach(() => {
      auditConsole.log('LOGIN', 'alice');
      auditConsole.log('UPDATE', 'bob');
      auditConsole.log('DELETE', 'alice');
    });

    it('debe retornar únicamente los registros del usuario indicado', () => {
      const aliceLogs = auditConsole.getLogsByUser('alice');

      expect(aliceLogs).toHaveLength(2);
      aliceLogs.forEach((entry) => expect(entry.user).toBe('alice'));
    });

    it('debe retornar un arreglo vacío si el usuario no tiene registros', () => {
      expect(auditConsole.getLogsByUser('charlie')).toEqual([]);
    });
  });

  // ---------------------------------------------------------------
  // getLogsByAction()
  // ---------------------------------------------------------------
  describe('getLogsByAction()', () => {
    beforeEach(() => {
      auditConsole.log('LOGIN', 'alice');
      auditConsole.log('LOGIN', 'bob');
      auditConsole.log('DELETE', 'alice');
    });

    it('debe retornar únicamente los registros con la acción indicada', () => {
      const loginLogs = auditConsole.getLogsByAction('LOGIN');

      expect(loginLogs).toHaveLength(2);
      loginLogs.forEach((entry) => expect(entry.action).toBe('LOGIN'));
    });

    it('debe retornar un arreglo vacío si no hay registros con esa acción', () => {
      expect(auditConsole.getLogsByAction('EXPORT')).toEqual([]);
    });
  });

  // ---------------------------------------------------------------
  // count()
  // ---------------------------------------------------------------
  describe('count()', () => {
    it('debe retornar 0 cuando no hay registros', () => {
      expect(auditConsole.count()).toBe(0);
    });

    it('debe reflejar el número correcto de registros', () => {
      auditConsole.log('LOGIN', 'user1');
      auditConsole.log('LOGOUT', 'user1');

      expect(auditConsole.count()).toBe(2);
    });
  });

  // ---------------------------------------------------------------
  // clear()
  // ---------------------------------------------------------------
  describe('clear()', () => {
    it('debe eliminar todos los registros almacenados', () => {
      auditConsole.log('LOGIN', 'user1');
      auditConsole.log('UPDATE', 'user2');

      auditConsole.clear();

      expect(auditConsole.getLogs()).toEqual([]);
      expect(auditConsole.count()).toBe(0);
    });

    it('no debe lanzar error al limpiar una consola ya vacía', () => {
      expect(() => auditConsole.clear()).not.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // Escenario de integración
  // ---------------------------------------------------------------
  describe('Escenario de integración', () => {
    it('debe gestionar correctamente un flujo completo de auditoría', () => {
      auditConsole.log('LOGIN', 'admin', { ip: '192.168.1.1' });
      auditConsole.log('CREATE', 'admin', { resource: 'user', resourceId: 10 });
      auditConsole.log('UPDATE', 'editor', { resource: 'article', resourceId: 5 });
      auditConsole.log('DELETE', 'admin', { resource: 'comment', resourceId: 3 });
      auditConsole.log('LOGOUT', 'editor');

      expect(auditConsole.count()).toBe(5);
      expect(auditConsole.getLogsByUser('admin')).toHaveLength(3);
      expect(auditConsole.getLogsByUser('editor')).toHaveLength(2);
      expect(auditConsole.getLogsByAction('LOGIN')).toHaveLength(1);
      expect(auditConsole.getLogsByAction('DELETE')).toHaveLength(1);

      auditConsole.clear();
      expect(auditConsole.count()).toBe(0);
    });
  });
});
