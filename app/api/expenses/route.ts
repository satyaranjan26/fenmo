import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, description, date, idempotencyKey } = body;

    if (!amount || !category || !date || !idempotencyKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert decimal amount to cents to avoid floating-point issues
    const amountCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountCents) || amountCents < 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check for idempotency
    const existingExpense = await prisma.expense.findUnique({
      where: { idempotencyKey },
    });

    if (existingExpense) {
      // If we already processed this request, safely return the existing resource
      return NextResponse.json(existingExpense, { status: 200 });
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        idempotencyKey,
        amountCents,
        category,
        description: description || '',
        date: new Date(date),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort'); // 'date_desc' or 'date_asc'

    const where = category && category !== 'All' ? { category } : {};
    const orderBy = sort === 'date_asc' ? { date: 'asc' as const } : { date: 'desc' as const };

    const expenses = await prisma.expense.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}
