<?php

use App\Http\Controllers\DatabaseController;
use Illuminate\Support\Facades\Route;

Route::post('/connect', [DatabaseController::class, 'connect']);

Route::group([], function () {
    Route::get('/schema', [DatabaseController::class, 'schema']);
    Route::post('/query', [DatabaseController::class, 'query']);
    Route::post('/ai/generate-sql', [DatabaseController::class, 'generateSQL']);
    Route::post('/ai/analyze', [DatabaseController::class, 'analyze']);
    Route::post('/ai/chat', [DatabaseController::class, 'chat']);
});
