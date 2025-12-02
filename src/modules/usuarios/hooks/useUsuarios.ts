import { useState, useEffect } from 'react';
import { IUsuario } from '@/modules/usuarios/types';
import { IErrorResponse } from '@/types/global';

const MOCK_USUARIOS_DATA: IUsuario[] = [
  { id: 1, nombre: 'Juan Perez', usuario: 123, totalMarca: 1, marcas: ['Codiesel'], sede: 10, estado: 'Activo' },
  { id: 2, nombre: 'Maria Gomez', usuario: 456, totalMarca: 2, marcas: ['Codiesel', 'Dieselco'], sede: 20, estado: 'Inactivo' },
  { id: 3, nombre: 'Jose Camargo', usuario: 777, totalMarca: 1, marcas: ['Dieselco'], sede: 20, estado: 'Activo' },
  { id: 4, nombre: 'Jonathan Sanchez', usuario: 888, totalMarca: 1, marcas: ['BYD'], sede: 10, estado: 'Inactivo' },
  { id: 5, nombre: 'Cristhian Sanchez', usuario: 333, totalMarca: 3, marcas: ['Dieselco', 'Mitsubishi', 'BYD'], sede: 20, estado: 'Activo' },
  { id: 6, nombre: 'Camila Rodriguez', usuario: 444, totalMarca: 4, marcas: ['Codiesel', 'Dieselco', 'Mitsubishi', 'BYD'], sede: 50, estado: 'Inactivo' },
  { id: 7, nombre: 'Karen Murillo', usuario: 555, totalMarca: 2, marcas: ['Mitsubishi', 'BYD'], sede: 20, estado: 'Activo' },
  { id: 8, nombre: 'Maria Gomez', usuario: 666, totalMarca: 2, marcas: ['Dieselco', 'Mitsubishi'], sede: 30, estado: 'Inactivo' },
  { id: 9, nombre: 'Mario Vargas', usuario: 999, totalMarca: 1, marcas: ['Mitsubishi'], sede: 10, estado: 'Activo' },
  { id: 10, nombre: 'Jesica Lopez', usuario: 101, totalMarca: 1, marcas: ['BYD'], sede: 10, estado: 'Activo' },
];

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUsuarios(MOCK_USUARIOS_DATA);
      } catch {
        setError({ message: 'Error al cargar usuarios', code: 500 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  return { usuarios, isLoading, error };
};
