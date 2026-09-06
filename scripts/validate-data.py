#!/usr/bin/env python3
"""Validate the JSON content files used by the static site."""

import json
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def read_json(name):
    path = DATA / name
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}")
    except json.JSONDecodeError as error:
        raise ValueError(f"{path}:{error.lineno}:{error.colno}: invalid JSON ({error.msg})")


def check_url(value, location):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{location}: URL must be a non-empty string")
    parsed = urlparse(value)
    if value == "#":
        return
    if parsed.scheme and parsed.scheme.lower() not in {"http", "https", "mailto", "tel"}:
        raise ValueError(f"{location}: URL protocol must be http(s), mailto, or tel")
    if value.startswith("//"):
        raise ValueError(f"{location}: protocol-relative URLs are not supported")


def main():
    site = read_json("site.json")
    courses = read_json("courses.json")
    research = read_json("research.json")
    resources = read_json("resources.json")

    if not isinstance(site.get("teacher"), dict):
        raise ValueError("site.json: teacher must be an object")
    for key in ("name", "email"):
        if not site["teacher"].get(key):
            raise ValueError(f"site.json: teacher.{key} is required")

    if not isinstance(courses, list):
        raise ValueError("courses.json: root must be an array")
    ids = [course.get("id") for course in courses]
    if any(not course.get("id") or not course.get("title") for course in courses):
        raise ValueError("courses.json: every course needs id and title")
    if len(ids) != len(set(ids)):
        raise ValueError("courses.json: course ids must be unique")
    for index, course in enumerate(courses):
        for key, value in (course.get("resources") or {}).items():
            check_url(value, f"courses.json:courses[{index}].resources.{key}")
        for week_index, week in enumerate(course.get("weeks") or []):
            if week.get("no") is None or not week.get("title"):
                raise ValueError(f"courses.json:courses[{index}].weeks[{week_index}] needs no and title")
            for key, value in (week.get("resources") or week.get("links") or {}).items():
                check_url(value, f"courses.json:courses[{index}].weeks[{week_index}].{key}")

    if not isinstance(research.get("topics"), list) or not isinstance(research.get("publications"), list):
        raise ValueError("research.json: topics and publications must be arrays")
    topic_ids = [topic.get("id") for topic in research["topics"]]
    if any(not topic_id for topic_id in topic_ids) or len(topic_ids) != len(set(topic_ids)):
        raise ValueError("research.json: topic ids must be present and unique")
    for index, publication in enumerate(research["publications"]):
        if not publication.get("title") or publication.get("year") is None or not publication.get("dir"):
            raise ValueError(f"research.json: publications[{index}] needs dir, year, and title")
        for link_index, link in enumerate(publication.get("links") or []):
            check_url(link.get("url"), f"research.json:publications[{index}].links[{link_index}]")

    if not isinstance(resources, list):
        raise ValueError("resources.json: root must be an array")
    for index, resource in enumerate(resources):
        for key in ("title", "description", "url"):
            if not resource.get(key):
                raise ValueError(f"resources.json: resources[{index}].{key} is required")
        check_url(resource["url"], f"resources.json:resources[{index}].url")

    print("Data OK: site, courses, research, resources")


try:
    main()
except ValueError as error:
    print(f"Data error: {error}", file=sys.stderr)
    sys.exit(1)
