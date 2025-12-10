# Seed Data Instructions

## Running the Seed Script

Due to PowerShell execution policy restrictions, you'll need to run the seed script manually:

### Option 1: Using Command Prompt (Recommended)
```cmd
cd apps\api
npx tsx prisma/seed.ts
```

### Option 2: Using PowerShell with Bypass
```powershell
cd apps\api
powershell -ExecutionPolicy Bypass -Command "npx tsx prisma/seed.ts"
```

### Option 3: Change PowerShell Execution Policy (Admin Required)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd apps\api
npm run prisma:seed
```

## Test Accounts Created

After running the seed script, you'll have these test accounts:

### Vendors
- **GasPlus Energy**: `gasplus@example.com` / `vendor123`
- **QuickGas Delivery**: `quickgas@example.com` / `vendor123`
- **Reliable Gas Services**: `reliablegas@example.com` / `vendor123`

### Customer
- **John Doe**: `customer@example.com` / `customer123`

## What's Seeded

- ✅ 3 verified vendors with business details
- ✅ 11 products across different vendors
- ✅ 1 test customer with delivery address
- ✅ Product variety: cylinders, refills, regulators, hoses
- ✅ Realistic pricing and stock levels

## Next Steps

1. Run the seed script using one of the methods above
2. Test the product catalog at `http://localhost:3000/products`
3. Test vendor listing at `http://localhost:3000/vendors`
4. Login as customer and place test orders
