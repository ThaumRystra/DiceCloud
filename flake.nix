{
  description = "";

  inputs = {
    nixpkgs.url = "git+https://forgejo.spacetime.technology/nix-mirrors/nixpkgs?ref=nixpkgs-unstable&shallow=1";
    flake-parts.url = "git+https://forgejo.spacetime.technology/nix-mirrors/flake-parts?shallow=1";
    system.url = "git+https://forgejo.spacetime.technology/arbel/nix-system?shallow=1";
  };

  outputs = { self, ... }@inputs:
  inputs.flake-parts.lib.mkFlake { inherit inputs self; } {
  flake = {

  };
  systems = inputs.system.arches;
    perSystem = { pkgs, ... }: {
      devShells = {
        default = pkgs.mkShell {
	  nativeBuildInputs = [
            pkgs.podman-compose
            pkgs.just
          ];
        };
      };
    };
  };
}
