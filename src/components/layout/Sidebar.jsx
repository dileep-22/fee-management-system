import React, { useContext } from 'react';
import { useApp } from 'context/AppContext';

const Sidebar = () => {
    const { payments } = useApp();
    const pendingCount = payments.filter(payment => payment.status === 'pending').length;

    return (
        <div>
            <h2>Pending Payments: {pendingCount}</h2>
            {/* Other sidebar content */}
        </div>
    );
};

export default Sidebar;