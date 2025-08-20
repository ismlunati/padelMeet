import React from 'react';

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    return (
        <header className="bg-brand-light-dark/80 backdrop-blur-sm sticky top-0 z-40 border-b border-brand-stroke">
            <div className="container mx-auto px-4 py-4 flex justify-center items-center relative">
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text">
                    PadelMeet
                </h1>
                {children}
            </div>
        </header>
    );
};

export default Header;