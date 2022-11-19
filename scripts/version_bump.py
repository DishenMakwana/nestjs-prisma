import argparse
import json


def increment_version(commit):
    with open("VERSION", "r") as f:
        file_content = f.read()
    file_content = file_content.split("\n")
    version = file_content[0].split(".")
    if commit.lower().startswith("[major]"):
        new_version = [str(int(version[0]) + 1), "0", "0"]
    elif commit.lower().startswith("[minor]"):
        new_version = [version[0], str(int(version[1]) + 1), "0"]
    else:
        new_version = [version[0], version[1], str(int(version[2]) + 1)]

    return ".".join(new_version)


def update_version(version):
    with open("VERSION", "w") as f:
        f.write(version)
    update_json_version(version,"package.json")
    # update_json_version(version,"package-lock.json") # if you have a package-lock.json file uncomment this line


def update_json_version(version, filename="package.json"):
    with open(filename, "r") as f:
        package_json = json.load(f)

    package_json["version"]=version

    with open(filename, "w") as f:
        json.dump(package_json, f, indent=2)
        f.write("\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--commit", required=True, help="commit message of last commit",
    )
    args = parser.parse_args()
    commit = args.commit

    version = increment_version(commit)
    update_version(version)
