using System;
using System.Reflection;
using System.Threading.Tasks;
using RazorLight;

namespace Thread.NET.BLL.Emails.Helper;

public class RazorParser
{
    private readonly Assembly _assembly;
    public RazorParser(Assembly assembly)
    {
        _assembly = assembly;
    }

    public async Task<string> ParseRazorTemplate<T>(string path, T model)
    {
        var template = EmbeddedResourceHelper.GetResourceAsString(_assembly, GenerateFileAssemblyPath(path, _assembly));
        var project = new InMemoryRazorLightProject();
        var engine = new RazorLightEngineBuilder().UseProject(project).Build();
        return await engine.CompileRenderStringAsync(Guid.NewGuid().ToString(), template, model);
    }

    private string GenerateFileAssemblyPath(string template, Assembly assembly)
    {
        string assemblyName = assembly.GetName().Name!;
        return string.Format("{0}.{1}.{2}", assemblyName, template, "cshtml");
    }
}