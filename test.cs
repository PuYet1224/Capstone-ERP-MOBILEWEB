using HoaiMinh.ERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

class Program {
    static void Main() {
        var optionsBuilder = new DbContextOptionsBuilder<HoaiMinhDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=CapstoneERP;Trusted_Connection=True;TrustServerCertificate=True;");
        using var db = new HoaiMinhDbContext(optionsBuilder.Options);
        
        var invoiceDetails = db.SALOrderInvoiceDetails.Where(x => x.InvoiceMaster == 21).ToList();
        Console.WriteLine($"Found {invoiceDetails.Count} details for invoice 21.");
        foreach(var d in invoiceDetails) {
            Console.WriteLine($"- ID: {d.Code}, OrderDetail: {d.OrderDetail}, Type: {d.TypeData}");
        }
    }
}
