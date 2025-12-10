
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function checkData() {
  let output = '';

  const vendors = await prisma.vendor.findMany({
    include: { user: { select: { email: true, firstName: true } } }
  });
  output += '--- VENDORS ---\n';
  vendors.forEach(v => {
      output += `ID: ${v.id} | User: ${v.user.email} (${v.user.firstName}) | BusName: ${v.businessName} | Status: ${v.status}\n`;
  });

  const products = await prisma.product.findMany({
      where: { name: 'Cooking Gas' }
  });
  output += '\n--- COOKING GAS PRODUCTS ---\n';
  products.forEach(p => {
      output += `ID: ${p.id} | VendorID: ${p.vendorId} | Price: ${p.price} | Stock: ${p.stock} | Active: ${p.isActive}\n`;
  });

  const orders = await prisma.order.findMany({
     orderBy: { createdAt: 'desc' },
     take: 5
  });
  output += '\n--- LAST 5 ORDERS ---\n';
  orders.forEach(o => {
      output += `ID: ${o.id} | VendorID: ${o.vendorId} | CustomerID: ${o.customerId} | Status: ${o.status} | Total: ${o.total}\n`;
  });

  fs.writeFileSync('db-debug-output.txt', output);
  console.log('Valid output written to db-debug-output.txt');
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
