{ pkgs }: {
    deps = [
        pkgs.psmisc
        pkgs.lsof
        pkgs.flyctl
        pkgs.nixos-rebuild
        pkgs.nano
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs-16_x
        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}