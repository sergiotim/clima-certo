<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:subscribers,email',
            'city' => 'required|string|max:255',
        ]);

        Subscriber::create([
            'email' => $request->email,
            'city' => $request->city,
        ]);

        return back()->with('success','Cadastro com sucesso!');
    }
}
