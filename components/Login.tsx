import React, { useState } from 'react';
import { courtService } from '../services/courtService';
import { Player } from '../types';
import { TennisRacketIcon } from './IconComponents';

interface LoginProps {
    onLoginSuccess: (user: Player, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('player@example.com'); // Default for easy testing
    const [password, setPassword] = useState('password'); // Default for easy testing
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { user, token } = await courtService.login(email, password);
            onLoginSuccess(user, token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const setAdminCredentials = () => {
        setEmail('admin@example.com');
        setPassword('password');
    }
    
    const setPlayerCredentials = () => {
        setEmail('player@example.com');
        setPassword('password');
    }

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="w-full max-w-md space-y-8 bg-brand-light-dark p-10 rounded-2xl border border-brand-stroke shadow-2xl">
                <div>
                    <div className="mx-auto h-12 w-12 text-brand-primary bg-brand-stroke rounded-full flex items-center justify-center">
                        <TennisRacketIcon className="h-8 w-8"/>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Inicia sesión en PadelMeet
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-lg border border-brand-stroke bg-brand-dark px-3 py-3 text-white placeholder-slate-400 focus:z-10 focus:border-brand-primary focus:outline-none focus:ring-brand-primary sm:text-sm"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-lg border border-brand-stroke bg-brand-dark px-3 py-3 text-white placeholder-slate-400 focus:z-10 focus:border-brand-primary focus:outline-none focus:ring-brand-primary sm:text-sm"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-brand-primary to-brand-secondary py-3 px-4 text-sm font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark disabled:from-slate-600 disabled:to-slate-700"
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm text-slate-400">
                    <p>Para demostración:</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <button onClick={setAdminCredentials} className="underline hover:text-brand-primary">Usar credenciales de Admin</button>
                        <button onClick={setPlayerCredentials} className="underline hover:text-brand-primary">Usar credenciales de Jugador</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
