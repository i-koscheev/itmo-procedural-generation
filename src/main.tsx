import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import Routing from './pages/routing';

import './index.css';

ReactDOM.createRoot( document.getElementById( 'root' )! ).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routing />
		</BrowserRouter>
	</React.StrictMode>,
);
