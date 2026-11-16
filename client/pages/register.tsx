import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { COMPANY_CONFIG } from '../lib/companyConfig';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Criar Conta - ${COMPANY_CONFIG.name}`}</title>
      </Head>
      <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
          <div>
            <h2 className="text-center text-2xl font-black text-neutral-950 uppercase tracking-tight">
              Crie sua conta
            </h2>
            <p className="mt-2 text-center text-xs text-neutral-600">
              Já possui conta?{' '}
              <Link
                href="/login"
                className="font-bold text-neutral-950 hover:underline"
              >
                Entre aqui
              </Link>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="shrink-0 text-red-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1"
              >
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="appearance-none block w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email-address"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1"
              >
                E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="appearance-none block w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="appearance-none block w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1"
              >
                Confirmar Senha
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="appearance-none block w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-neutral-950 hover:bg-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
