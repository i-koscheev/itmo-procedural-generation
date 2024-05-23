/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;

import { OverlappingModel } from '../../../wfc/overlapping-model';
import { handleWorkerMessage } from '../common/handle-worker-message';

self.onmessage = function( e ) {
	handleWorkerMessage( self, e,
		// @ts-ignore
		( ...args ) => new OverlappingModel( ...args ),
	);
};