/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { handleWorkerMessage } from '../common/handle-worker-message';

import { OriginalOverlappingModel } from './wfc/overlapping-model';

self.onmessage = function( e ) {
	handleWorkerMessage( self, e,
		// @ts-ignore
		( ...args ) => new OriginalOverlappingModel( ...args ),
	);
};